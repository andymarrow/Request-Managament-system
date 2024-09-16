import { Response, Request } from 'express';
// import { NextApiRequest, NextApiResponse } from "next";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.userEmail,
    pass: process.env.userPassword,
  },
});

const sendUserCredentials = async (
  to: string,
  subject: string,
  text: string
) => {
  const mailOptions = {
    from: '"Naol Solomon "<naolsolomon10@gmail.com>',
    to: to,
    subject: subject,
    text: text,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

const newUser = async (req: Request, res: Response) => {
  const {
    username,
    email,
    password,
    phoneNumber,
    role,
    department,
    confirmPassword,
  } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const hashedPassword = await bcrypt.hashSync(password, 10);

    const departments = await prisma.department.findUnique({
      where: {
        department_name: department,
      },
    });
    const user = await prisma.user.create({
      data: {
        username: username,
        email: email,
        password: hashedPassword,
        phone_number: phoneNumber,
        role: role,
        Department: {
          connect: {
            department_id: departments?.department_id,
          },
        },
      },
    });
    res.status(201).json({ message: 'User created successfully' });

    const subject = 'Your Maintenance Account Credentials';
    const text = `Hello ${username}  
           Your Maintenance Request account has been created successfully. 

           Below are your login credentials:
            Username: ${username}
            Password: ${password}

            Please make sure to change your password after your first login.

            Maintenance Request Administration Office`;
    await sendUserCredentials(email, subject, text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUsersList = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { activated: true },
      include: {
        Department: true,
      },
    });
    // console.log(users);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDisabledUsersList = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { activated: false },
      include: {
        Department: true,
      },
    });
    console.log(users);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Use the secret from environment variables
const secret = process.env.JWT_KEY || 'default_secret'; // Fallback to a default secret if env variable is not set

const updateUserPassword = async (req: Request, res: Response) => {
  const { username, currentPassword, newPassword } = req.body;
  console.log(`${username},${currentPassword},${newPassword}`);
  try {
    // Find the user by username
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    // If user does not exist, return an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.user.update({
      where: {
        username: username,
      },
      data: {
        password: hashedNewPassword,
      },
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateUserStatus = async (req: Request, res: Response) => {
  const { id } = req.query;
  const { activated } = req.body;

  console.log(id, activated);
  try {
    const user = await prisma.user.update({
      where: {
        user_id: Number(id),
      },
      data: {
        activated: activated,
      },
    });
    res.status(200).json({ message: 'Updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to update user status' });
  }
};

// Department related functions
const newDepartment = async (req: Request, res: Response) => {
  const { department_name } = req.body;
  console.log(department_name);

  try {
    const department = await prisma.department.create({
      data: { department_name: department_name },
    });
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany();
    // console.log(departments);
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeDepartment = async (req: Request, res: Response) => {
  const department_id = parseInt(req.query.id as string);

  try {
    const department = await prisma.department.delete({
      where: { department_id: department_id },
    });

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message:
        'You cannot delete this department. It has relation with other table.',
    });
  }
};

const updateUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { username, email, departmentName, phoneNumber, role } = req.body; // Changed department_name to departmentName

  console.log(req.body);

  try {
    // Find the department by departmentName
    const departments = await prisma.department.findUnique({
      where: { department_name: departmentName },  // Use departmentName from req.body
    });

    if (!departments) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Update user with new details and connect to the found department
    const updatedUser = await prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        username,
        email,
        phone_number: phoneNumber,
        role,
        Department: {
          connect: {
            department_id: departments.department_id,
          },
        },
      },
    });

    res.status(200).send('User updated successfully');
  } catch (error: any) {
    console.error('Error updating user:', error);
    res.status(500).send('Error updating user: ' + error.message);
  }
};


export {
  newUser,
  newDepartment,
  getDepartments,
  removeDepartment,
  getUsersList,
  updateUserPassword,
  updateUserStatus,
  getDisabledUsersList,
  updateUser,
};
