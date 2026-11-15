import Contact from '../models/Contact.js';

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error('All fields are required');
    }
    const contact = await Contact.create({ name, email, subject, message });
    res.status(201).json({ message: 'Your message has been recorded. We will get back to you soon.', id: contact._id });
  } catch (error) {
    next(error);
  }
};

export const getContactMessages = async (req, res, next) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    next(error);
  }
};
