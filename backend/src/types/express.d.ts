import { AccessTokenPayload } from "../shared/utils/token";

declare global {
  namespace Express {
    interface User extends AccessTokenPayload {}
    interface Request {
      user?: User;
    }
  }
}

export {};
