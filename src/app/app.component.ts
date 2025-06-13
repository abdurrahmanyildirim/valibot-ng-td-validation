import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ValidationDirective } from './validation.directive';
import { ErrorDisplayDirective } from './error-display.directive';
import { JsonPipe, KeyValuePipe } from '@angular/common';
import { sanitizePathToClass } from './util';
import { MatIcon } from '@angular/material/icon';
import { User, USER_SCHEMA } from './user.model';
// import '@valibot/i18n/de';
// import * as v from 'valibot';
// Set the language configuration globally
// v.setGlobalConfig({ lang: 'de' });

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [
    FormsModule,
    ValidationDirective,
    ErrorDisplayDirective,
    KeyValuePipe,
    JsonPipe,
    MatIcon,
  ],
})
export class AppComponent {
  user: User = {
    username: 'Abdurrahman',
    email: 'Apollo@Valibot.com',
    age: 18,
    contacts: [],
  };
  schema = USER_SCHEMA();

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

  removeContact(index: number): void {
    this.user.contacts.splice(index, 1);
  }
}

/**
 * - Valibot actions eg. trim
 * - abortEarly
 * - localization
 */
