import { Response, Request, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { request } from 'http';
const prisma = new PrismaClient();
// Define the interface for the JWT payload
interface DecodedToken {
  userId: string;
  username: string;
  role: string;
}
export const newUser = async (req: Request, res: Response) => {
  const {
    requester_name,
    phone_number,
    priority,
    request_type,
    model_no,
    other_request_type,
    device_type,
    email,
    description,
    employee_id, // This corresponds to user_id in the user model
    department_name, // This is the name of the department to fetch department_id
  } = req.body;

  try {
    // Fetch the department_id based on the department_name
    let department_id = null;

    if (department_name) {
      const department = await prisma.department.findUnique({
        where: { department_name },
        select: { department_id: true },
      });

      if (department) {
        department_id = department.department_id;
      } else {
        return res.status(400).json({ message: 'Invalid department name' });
      }
    }

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        requester_name,
        email,
        phone_number,
        request_type,
        description: description || '',
        priority,
        other_request_type: other_request_type || '',
        model_no: model_no || '',
        device_type,
        employee_id,
        department: department_id
          ? {
              connect: { department_id },
            }
          : undefined,
        user: {
          connect: { user_id: employee_id }, // Connect the initial user
        },
      },
    });

    res.status(201).json({
      message: 'Maintenance request created successfully',
      maintenanceRequest,
    });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: 'Server error', error: err.message });
    } else {
      res
        .status(500)
        .json({ message: 'Server error', error: 'An unknown error occurred' });
    }
  }
};

// Controller function to get maintenance requests by employee name
export const getMaintenanceRequests = async (req: Request, res: Response) => {
  try {
    // Extract the token from the authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_KEY as string;

    if (!secret) {
      throw new Error('No token key is specified in environment variable');
    }

    // Decode the JWT token
    const decodedToken = jwt.verify(token, secret) as { userId: string };
    const { userId } = decodedToken;
    console.log('User ID from Token:', userId);

    // Fetch the maintenance requests for the user
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        employee_id: parseInt(userId), // Ensure userId is a number
      },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching maintenance requests' });
  }
};

// export const getMaintenanceRequestsApproval = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     // Extract the token from the authorization header
//     const authHeader = req.headers['authorization'];
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res
//         .status(401)
//         .json({ error: 'Authorization token missing or invalid' });
//     }

//     const token = authHeader.split(' ')[1];
//     const secret = process.env.JWT_KEY as string;

//     if (!secret) {
//       throw new Error('No token key is specified in environment variable');
//     }

//     // Decode the JWT token
//     const decodedToken = jwt.verify(token, secret) as { departementId: string };
//     const { departementId } = decodedToken;
//     console.log('User ID from Token:', departementId);

//     // Fetch the maintenance requests for the user
//     const requests = await prisma.maintenanceRequest.findMany({
//       where: {
//         department_id: parseInt(departementId), // Ensure userId is a number
//       },
//     });

//     res.status(200).json(requests);
//   } catch (error) {
//     console.error('Error fetching maintenance requests:', error);
//     res
//       .status(500)
//       .json({ error: 'An error occurred while fetching maintenance requests' });
//   }
// };

// Route handler to get maintenance requests for approval
// export const getMaintenanceRequestsApproval = async (req: Request, res: Response) => {
//   // try {
//   const userId = req.user?.userId; // Get user ID from decoded JWT

//   if (typeof userId !== 'number') {
//     return res.status(401).json({ error: 'Unauthorized' });
//   }

//   // Find the user to get their department ID
//   const user = await prisma.user.findUnique({
//     where: { user_id: userId }, // Ensure userId is a number
//     select: { department_id: true }
//   });

//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   const departmentId = user.department_id;

//   // Fetch maintenance requests for the department
//   const requests = await prisma.maintenanceRequest.findMany({
//     where: { department_id: departmentId },
//     include: {
//       department: true,
//       user: true
//     },
//     orderBy: {
//       created_at: 'desc'
//     }
//   });

//   res.json(requests);
// } catch (error) {
//   console.error('Error fetching requests:', error);
//   res.status(500).json({ error: 'Internal server error' });
// }
//   try {
//     // Extract the token from the authorization header
//     const authHeader = req.headers['authorization'];
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ error: 'Authorization token missing or invalid' });
//     }

//     const token = authHeader.split(' ')[1];
//     const secret = process.env.JWT_KEY as string;

//     if (!secret) {
//       throw new Error("No token key is specified in environment variable");
//     }

//     // Decode the JWT token
//     const decodedToken = jwt.verify(token, secret) as { userId: string };
//     const { userId } = decodedToken;
//     console.log("User ID from Token:", userId);

//     // Fetch the maintenance requests for the user
//     const requests = await prisma.maintenanceRequest.findMany({
//       where: {
//         employee_id: parseInt(userId), // Ensure userId is a number

//       }
//     });

//     res.status(200).json(requests);
//   } catch (error) {
//     console.error('Error fetching maintenance requests:', error);
//     res.status(500).json({ error: 'An error occurred while fetching maintenance requests' });
//   }
// };

export const getMaintenanceRequestsApproval = async (
  req: Request,
  res: Response
) => {
  try {
    // Extract the token from the authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ error: 'Authorization token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_KEY as string;

    if (!secret) {
      throw new Error('No token key is specified in environment variable');
    }

    // Decode the JWT token
    const decodedToken = jwt.verify(token, secret) as { departementId: string };
    const { departementId } = decodedToken;
    console.log('User ID from Token:', departementId);

    // Fetch the maintenance requests for the user
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        department_id: parseInt(departementId), // Ensure userId is a number
      },
    });

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching maintenance requests' });
  }
};

export const getMaintenanceRequestsByName = async (
  req: Request,
  res: Response
) => {
  const request_id = parseInt(req.params.request_id, 10); // Convert to number

  if (isNaN(request_id)) {
    return res.status(400).json({ message: 'Invalid request ID' });
  }

  try {
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        request_id: request_id,
      },
    });

    console.log(requests);

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateRequestStatus = async (req: Request, res: Response) => {
  const { request_id } = req.params;
  const { status } = req.body;

  try {
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: {
        request_id: Number(request_id),
      },
      data: {
        status,
      },
    });

    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update request status', error });
  }
};
export const getUserInfo = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.userId, 10);

  try {
    // Fetch user information
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        // Only select fields needed
        username: true,
        email: true,
        department_id: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch department name if department_id exists
    let departmentName = '';
    console.log(user.department_id);
    if (user.department_id) {
      const department = await prisma.department.findUnique({
        where: { department_id: user.department_id },
        select: { department_name: true },
      });

      if (department) {
        departmentName = department.department_name;
      }
    }

    // Respond with user information and department name
    res.json({
      username: user.username,
      email: user.email,
      department_name: departmentName,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: 'Server error' });
  }
};

const addNewRequestType = async (req: Request, res: Response) => {
  const { request_type_name } = req.body;
  console.log(request_type_name);

  try {
    const requestType = await prisma.requestType.create({
      data: { request_type_name: request_type_name },
    });

    res
      .status(200)
      .json({ message: 'Request type created successfully', requestType });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeRequestType = async (req: Request, res: Response) => {
  const requestTypeId = parseInt(req.query.id as string);

  try {
    const requestType = await prisma.requestType.delete({
      where: { request_type_id: requestTypeId },
    });
    res.status(200).json({ message: ' Request Type deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

const requestTypeList = async (req: Request, res: Response) => {
  try {
    const requestTypes = await prisma.requestType.findMany();
    res.status(200).json(requestTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
const getRequestTypelist = async (req: Request, res: Response) => {
  try {
    const requestTypes = await prisma.requestType.findMany();
    res.status(200).json(requestTypes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDepartmentName = async (req: Request, res: Response) => {
  const { departmentId } = req.params;

  try {
    const department = await prisma.department.findUnique({
      where: { department_id: parseInt(departmentId) },
      select: { department_name: true },
    });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ name: department.department_name });
  } catch (error) {
    console.error('Error fetching department name:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPendingRequests = async (req: Request, res: Response) => {
  try {
    const pendingRequests = await prisma.maintenanceRequest.findMany({
      where: { status: 'Pending' },
      include: {
        department: {
          select: {
            department_name: true,
          },
        },
      },
    });

    res.status(200).json(pendingRequests);
  } catch (err) {
    res.status(500).json({
      message: 'Cannot find maintenance request with status pending',
      err,
    });
  }
};

export const getRequestList = async (req: Request, res: Response) => {
  try {
    const requestTypes = await prisma.requestType.findMany({
      select: {
        request_type_name: true,
      },
    });
    res.json(requestTypes);
  } catch (error) {
    console.error('Error fetching request types:', error);
    res.status(500).send('Server Error');
  }
};

const getDetialOfPendingRequest = async (req: Request, res: Response) => {
  const requestId = parseInt(req.params.id, 10);
  console.log(requestId);
  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { request_id: requestId },
      include: {
        department: {
          select: {
            department_name: true,
          },
        },
        RequestType: {
          select: {
            request_type_name: true,
          },
        },
      },
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    console.error('Error fetching request details:', error);
    res.status(500).json({ message: 'Error fetching request details', error });
  }
};

export const updateRequestStatusforrejection = async (
  req: Request,
  res: Response
) => {
  const { request_id } = req.params;
  const { status, rejectionReason } = req.body;

  try {
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { request_id: Number(request_id) },
      data: {
        status,
        reasonOnRejection: rejectionReason || null,
      },
    });
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
};

export const updateRequestStatusfordepartment = async (
  req: Request,
  res: Response
) => {
  const { request_id } = req.params; // Extract the request_id from the URL
  const { priority } = req.body; // Extract the priority from the request body

  try {
    // Update the maintenance request's priority in the database
    const updatedRequest = await prisma.maintenanceRequest.update({
      where: { request_id: Number(request_id) }, // Convert request_id to a number
      data: { priority }, // Update the priority
    });

    // Send back the updated request
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request priority:', error);
    res.status(500).send('Failed to update priority');
  }
};


// In your API controller (e.g., requestController.ts)
export const getRejectionReason = async (req: Request, res: Response) => {
  const { request_id } = req.body;

  try {
    const request = await prisma.maintenanceRequest.findUnique({
      where: { request_id: Number(request_id) },
      select: {
        reasonOnRejection: true,
      },
    });

    if (!request || !request.reasonOnRejection) {
      return res.status(404).json({ success: false, message: "No rejection reason found." });
    }

    res.json({ success: true, reasonOnRejection: request.reasonOnRejection });
  } catch (error) {
    console.error('Error fetching rejection reason:', error);
    res.status(500).json({ success: false, message: "Failed to fetch rejection reason." });
  }
};


export {
  addNewRequestType,
  removeRequestType,
  requestTypeList,
  getPendingRequests,
  getRequestTypelist,
  getDetialOfPendingRequest,
};
