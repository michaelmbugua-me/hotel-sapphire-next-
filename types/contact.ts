/** Response body of POST /api/contact (same shape the Angular app consumed). */
export type ContactResponse = {
  readonly success: boolean;
  readonly message: string;
};
