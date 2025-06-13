import { debounceTime, firstValueFrom, of } from 'rxjs';
import * as v from 'valibot';



export type User = {
  username: string;
  email: string;
  age: number;
  contacts: {
    name: string;
    phone: string;
    address?: {
      country: string;
      street: string;
      city: string;
    };
  }[];
};

export const USER_SCHEMA = () =>
  v.objectAsync({
    username: v.pipe(
      v.string(),
      v.nonEmpty('Please enter your username.'),
      v.minLength(3, 'Username must be at least 3 characters long'),
    ),
    email: v.pipeAsync(
      v.string('Your email must be a string.'),
      v.nonEmpty('Please enter your email.'),
      v.email('The email address is badly formatted.'),
      v.checkAsync(isEmailTaken, 'This email is already taken.'),
    ),
    age: v.pipe(v.number(), v.maxValue(20, 'Age must be less than 20.')),
    contacts: v.pipe(
      v.array(
        v.object({
          name: v.pipe(v.string(), v.nonEmpty('Please enter address name.')),
          phone: v.string(),
          address: v.object({
            country: v.pipe(
              v.string(),
              v.nonEmpty('Please enter address country.'),
              v.minLength(2, 'Country must be at least 2 characters long'),
            ),
            street: v.pipe(
              v.string(),
              v.nonEmpty('Please enter address street.'),
            ),
            city: v.string(),
          }),
        }),
      ),
      v.minLength(1, 'Please enter at least one contact.'),
    ),
  });

// Mock email request
function isEmailTaken(email: string): Promise<boolean> {
  const takenEmail = email.toLowerCase();
  if (takenEmail === 'taken@valibot.com') {
    return firstValueFrom(of(false).pipe(debounceTime(100)));
  }

  return firstValueFrom(of(true).pipe(debounceTime(100)));
}
