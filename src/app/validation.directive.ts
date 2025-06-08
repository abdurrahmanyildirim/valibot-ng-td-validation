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
 * contacts[0].name
 * contacts[2].address.country
 *
 */
type path = string;
type message = string;

type issuePath = {
  input: any;
  key: string | number;
  origin: any;
  type: string;
  value: any;
};

@Directive({
  selector: 'form[schema]',
})
export class ValidationDirective<T> implements OnInit {
  private readonly ngForm = inject(NgForm);
  private readonly destroyRef = inject(DestroyRef);

  public readonly schema = input.required<v.ObjectSchemaAsync<any, any>>();
  public readonly value = input.required<T>();

  public readonly errorMap = signal<Record<path, message[]>>({});

  public readonly errorMessages = outputFromObservable(
    toObservable(this.errorMap).pipe(takeUntilDestroyed(this.destroyRef))
  );

  ngOnInit(): void {
    this.ngForm.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef), debounceTime(100))
      .subscribe(() => {
        v.safeParseAsync(this.schema(), this.value()).then((result) => {
          this.mapErrors(result);
        });
      });
  }

  mapErrors(result: v.SafeParseResult<v.ObjectSchema<any, any>>): void {
    const errMap: Record<path, message[]> = {};
    if (result.issues && result.issues.length > 0) {
      result.issues.forEach((issue) => {
        const path = issue.path
          .map((p: issuePath, i: number) => {
            if (p.type === 'array') {
              return `[${p.key}]`;
            }
            if (i === 0) {
              return p.key;
            }
            return '.' + p.key;
          })
          .join('');

        const errorMessages = errMap[path];
        if (errorMessages) {
          errorMessages.push(issue.message);
          // errMap.set(path, errorMessages);
        } else {
          errMap[path] = [issue.message];
        }
      });
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
