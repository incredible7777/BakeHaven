
// Purpose: Contact Inquiries Submission

import { Contact } from "../models/contact.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

//purpose : contact form submission
export const submitContact=asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    throw new ApiError(400, "All contact fields are required");
  }

  const newContact = await Contact.create({
    name,
    email,
    phone,
    message,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newContact, "Message sent successfully! We will contact you soon.")
    );
});