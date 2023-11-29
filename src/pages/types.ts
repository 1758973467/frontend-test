export enum EGender {
  Female = 0,
  Male = 1,
}

export interface IUser {
  id: number;
  name: string;
  gender: EGender;
}
