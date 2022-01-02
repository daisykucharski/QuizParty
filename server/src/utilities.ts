/**
 * Generates a random 6 digit room code
 * @returns a random room code
 */
export const generateRandomCode = (): string => {
  var result = "";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (var i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * 26)];
  }

  return result;
};
