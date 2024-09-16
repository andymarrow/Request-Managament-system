import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

export const helpDeskController = async (req: Request, res: Response) => {
  const { title, video_url, description } = req.body;
  console.log(req.body);

  let descriptionJson;
  try {
    descriptionJson = JSON.parse(description);
    console.log(descriptionJson);
  } catch (err: any) {
    console.log(`Error parsing description: ${err.message()}`);
    res.status(400).json({ message: 'Invalid Json format for description' });
  }

  // to check whether it is in form valid json
  if (
    !Array.isArray(descriptionJson) ||
    !descriptionJson.every((step) => step.texts && step.order)
  ) {
    return res.status(400).json({
      message:
        'Description must be an array of steps, each with text and order',
    });
  }

  descriptionJson.sort((a, b) => a.order - b.order);

  try {
    const newHelpDesk = await prisma.problemSearch.create({
      data: {
        title: title,
        video_url: video_url,
        description: descriptionJson,
      },
    });
    res.status(201).json({ message: 'Help Desk added successfully' });
  } catch (error) {
    res.status(500).json({
      message:
        'Help Desk is not added successfully. Returned with error: ' + error,
    });
  }
};

export const getHelpDeskLists = async (req: Request, res: Response) => {
  try {
    const helpDeskList = await prisma.problemSearch.findMany({
      select: {
        solution_id: true,
        title: true,
        video_url: true,
        description: true,
        created_at: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    res.status(200).json(helpDeskList);
  } catch (error) {
    res.status(500).json({ message: 'Error in fetching the data' });
  }
};

// Search problems by title from the ProblemSearch model
export const searchProblems = async (req: Request, res: Response) => {
  const { query } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    const results = await prisma.problemSearch.findMany({
      where: {
        title: {
          contains: query.toLowerCase(), // Convert the query to lowercase
        },
      },
      select: {
        solution_id: true,
        title: true,
        video_url: true,
        description: true,
        created_at: true,
      },
    });

    if (results.length === 0) {
      return res.status(404).json({ message: 'No results found' });
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching search results:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while searching for problems' });
  }
};

// Search a problem by ID from the ProblemSearch model
export const searchProblemById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  try {
    const result = await prisma.problemSearch.findUnique({
      where: {
        solution_id: parseInt(id, 10), // Ensure the ID is an integer
      },
      select: {
        solution_id: true,
        title: true,
        video_url: true,
        description: true,
        created_at: true,
      },
    });

    if (!result) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the problem' });
  }
};

export const handleHelpDeskRemove = async (req: Request, res: Response) => {
  const helpDesk = parseInt(req.params.id, 10);
  console.log(helpDesk);

  if (!helpDesk) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  try {
    const result = await prisma.problemSearch.delete({
      where: {
        solution_id: helpDesk, // Ensure the ID is an integer
      },
    });

    if (!result) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching problem:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the problem' });
  }
};
