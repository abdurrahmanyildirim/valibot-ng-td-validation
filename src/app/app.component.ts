import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as v from 'valibot';
import { ValidationDirective } from './validation.directive';
import { ValidationErrorMsgDirective } from './validation-error-msg.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { KeyValuePipe } from '@angular/common';
import { sanitizePathToClass } from './util';

const userSchema = v.object({
  username: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your username.'),
    v.minLength(3, 'Username must be at least 3 characters long')
  ),
  email: v.pipe(
    v.string('Your email must be a string.'),
    v.nonEmpty('Please enter your email.'),
    v.email('The email address is badly formatted.')
  ),
  contacts: v.pipe(
    v.array(
      v.object({
        name: v.pipe(v.string(), v.nonEmpty('Please enter address name.')),
        phone: v.string(),
        address: v.object({
          country: v.pipe(
            v.string(),
            v.nonEmpty('Please enter address country.'),
            v.minLength(2, 'Country must be at least 2 characters long')
          ),
          street: v.pipe(
            v.string(),
            v.nonEmpty('Please enter address street.')
          ),
          city: v.string(),
        }),
      })
    ),
    v.minLength(1, 'Please enter at least one contact.')
  ),
});

type User = {
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

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    FormsModule,
    ValidationDirective,
    ValidationErrorMsgDirective,
    MatTooltip,
    KeyValuePipe,
  ],
})
export class AppComponent {
  user: User = {
    username: 'Abdurrahman',
    email: 'Apollo@Valibot.com',
    age: 18,
    contacts: [],
  };
  schema = userSchema;

  errorMessages = signal<Record<string, string[]>>({});

  addContact(): void {
    this.user.contacts.push({
      name: '',
      phone: '',
      address: {
        country: '',
        street: '',
        city: '',
      },
    });
  }

  focusOnError(path: string): void {
    const sanitizedPath = sanitizePathToClass(path);
    const el = document.querySelector(`.${sanitizedPath}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });

      if ('focus' in el) {
        (el as HTMLElement).focus();
      }
    }
  }
}
