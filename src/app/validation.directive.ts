import {
  DestroyRef,
  Directive,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import {
  outputFromObservable,
  takeUntilDestroyed,
  toObservable,
} from '@angular/core/rxjs-interop';
import { NgForm } from '@angular/forms';
import { debounceTime } from 'rxjs';
import * as v from 'valibot';

/**
 * Path of the error
 * @example
 * contacts.0.name
 * contacts.2.address.country
 *
 */
type path = string;
type message = string;

/**
 * Directive to validate the form value with the given schema and emit error messages
 */
@Directive({
  selector: 'form[schema]',
})
export class ValidationDirective<T> implements OnInit {
  private readonly ngForm = inject(NgForm);
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Schema of the current value
   */
  public readonly schema = input.required<v.ObjectSchemaAsync<any, any>>();

  /**
   * Form value
   */
  public readonly value = input.required<T>();

  /**
   * Error map of the current value
   * It will be updated when the form value changes
   *
   * Example:
   * {
   *   'contacts.0.name': ['Please enter address name.'],
   *   'contacts.0.phone': ['Please enter address phone.'],
   *   'contacts.1.name': ['Please enter address name.'],
   *   'contacts.1.phone': ['Please enter address phone.'],
   * }
   */
  public readonly errorMap = signal<Record<path, message[]>>({});

  /**
   * Output for error messages
   */
  public readonly errorMessages = outputFromObservable(
    toObservable(this.errorMap).pipe(debounceTime(100)),
  );

  ngOnInit(): void {
    /**
     * Listen value changes of the form
     * Validate the form value with the schema
     * Map the errors to the errorMap
     */
    this.ngForm.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(100))
      .subscribe(() => {
        v.safeParseAsync(this.schema(), this.value()).then((result) => {
          this.mapErrors(result);
        });
      });
  }

  mapErrors(result: v.SafeParseResult<v.ObjectSchema<any, any>>): void {
    let errMap: Record<path, message[]> = {};
    if (result.issues) {
      const flattenIssues = v.flatten(result.issues);
      if (flattenIssues.nested) {
        errMap = flattenIssues.nested as Record<path, message[]>;
      }
    }
    this.errorMap.set({ ...errMap });
    // console.log({
    //   valibotResult: result,
    //   isValid: result.success,
    //   value: this.value(),
    //   errMap,
    // });
  }
}
