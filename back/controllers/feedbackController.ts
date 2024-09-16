import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getTechnicianNameInfo = async (req: Request, res: Response) => {
  const { requestId } = req.body; // Extract from body
  console.log(requestId);
  try {
    // Fetch the completion confirmation entry using the requestId
    const completionConfirmation =
      await prisma.completionConfirmation.findUnique({
        where: {
          request_id: Number(requestId),
        },
      });

    if (!completionConfirmation) {
      return res
        .status(404)
        .json({ message: 'Completion confirmation not found' });
    }

    // Fetch the technician details from the user table
    const technician = await prisma.user.findUnique({
      where: {
        user_id: completionConfirmation.technician_id,
      },
    });

    if (!technician) {
      return res.status(404).json({ message: 'Technician not found' });
    }

    // Return the technician's username
    res.status(200).json({
      success: true, // Include a success key for consistency with your frontend check
      technicianName: technician.username,
    });
  } catch (error) {
    console.error('Error fetching technician information:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTechnicianIDInfo = async (req: Request, res: Response) => {
  const { username } = req.body; // Extract from body

  try {
    // Fetch the completion confirmation entry using the requestId
    const technician_id = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!technician_id) {
      return res.status(404).json({ message: 'technician_id not found' });
    }

    // Return the technician's username
    res.status(200).json({
      success: true, // Include a success key for consistency with your frontend check
      technician_id: technician_id.user_id,
    });
  } catch (error) {
    console.error('Error fetching technician information:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const addFeedback = async (req: Request, res: Response) => {
  const { requestId, employeeId, technicianId, rating, comments } = req.body;

  try {
    // Create new feedback
    const newFeedback = await prisma.feedback.create({
      data: {
        request_id: Number(requestId),
        employee_id: Number(employeeId),
        technician_id: Number(technicianId),
        rating: Number(rating),
        comments,
      },
    });

    res.status(200).json({ success: true, feedback: newFeedback });
    //in the below we found the related info between the 2 tables
    const upateConfirmationTable =
      await prisma.completionConfirmation.findUnique({
        where: {
          request_id: Number(requestId),
        },
      });

    if (!upateConfirmationTable) {
      res.status(500).json({
        success: false,
        message: 'unable to find request with this id',
      });
    }
    //we update the completionconfirmation tables feedback id entry
    const updateTheFeedbackEntry = await prisma.completionConfirmation.update({
      // data: {
      //     feedback_id: newFeedback.feedback_id,

      // },
      where: {
        request_id: upateConfirmationTable?.request_id,
      },
      data: {
        feedback_id: newFeedback.feedback_id,
      },
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({ success: false, message: 'Failed to add feedback' });
  }
};
export const getCompletions = async (req: Request, res: Response) => {
  try {
    // Fetch confirmationCompletion data with related data
    const completions = await prisma.completionConfirmation.findMany({
      include: {
        Technician: true, // Include Technician (user model)
        Request: true, // Include MaintenanceRequest
        feedbackRecived: {
          include: {
            user: true,
          },
        }, // Include feedback if any
      },
    });
    res.status(200).json(completions);
  } catch (error) {
    console.error('Error fetching completions:', error);
    res.status(500).json({ error: 'Failed to fetch completions' });
  }
};
