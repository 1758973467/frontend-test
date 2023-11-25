import { faker } from '@faker-js/faker';
import { EGender, type IUser } from '../types';
export function generateMockData() {
  const result: {
    total: number;
    data: IUser[];
  } = {
    data: [],
    total: 100,
  };
  for (let i = 0; i < 10; i++) {
    result.data.push({
      id: i,
      name: faker.person.fullName(),
      gender: faker.person.sexType() as EGender,
    });
  }
  return result;
}
