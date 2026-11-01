// ========================================================
// File: backend/utils/AsyncHandler.js
// Purpose: Express Async Wrapper resolving promises and catching errors to next()
// ========================================================
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((error) => next(error));
  };
};

export { asyncHandler };
export default asyncHandler;
