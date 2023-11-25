export enum EGender {
  Female = 'female',
  Male = 'male',
}

export interface IUser {
  id: number;
  name: string;
  gender: EGender;
}
