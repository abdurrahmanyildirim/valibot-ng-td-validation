import {
  afterRenderEffect,
  computed,
  Directive,
  inject,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { ValidationDirective } from './validation.directive';
import { sanitizePathToClass } from './util';

/**
 * Directive to display error messages.
 *
 * Catch the correct error messages and display them as data-error attribute.
 *
 * css after pseudo element is used to display the error message.
 */
@Directive({
  selector: '[errorDisplay]',
})
export class ErrorDisplayDirective implements OnInit {
  /**
   * Inject the validation directive
   * Error messages will be mapped in this directive
   */
  private readonly validationDirective = inject(ValidationDirective);
  private readonly ngModel = inject(NgModel);
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Get the input path of the current input
   */
  private readonly inputPath = computed(() =>
    Array.isArray(this.ngModel?.path) ? this.ngModel.path.join('.') : '',
  );

  /**
   * Check if there is an error message for the current input with the given path
   */
  private readonly errMsg = computed(
    () => this.validationDirective.errorMap()[this.inputPath()],
  );

  /**
   * Parent element of the input. It will be used to add error message helper
   */
  private readonly parentElement: HTMLElement =
    this.viewContainerRef.element.nativeElement.parentElement;

  /**
   * Observe the error of current input and add message as data-error attribute.
   */
  private readonly errorMsgEffect = afterRenderEffect(() => {
    const messages = this.errMsg();
    const el: HTMLElement = this.viewContainerRef.element.nativeElement;
    if (messages?.length) {
      // Add invalid-input class to the input
      el.classList.add('invalid-input');

      // Mark the input with path as class. It will be used to focus on the field
      el.classList.add(sanitizePathToClass(this.inputPath()));

      // Set data-error with the first error message
      this.parentElement?.setAttribute('data-error', messages[0]);
    } else {
      // Clean up input and parent element
      el.classList.remove('invalid-input');
      el.classList.remove(sanitizePathToClass(this.inputPath()));
      this.parentElement?.removeAttribute('data-error');
    }
  });

  ngOnInit(): void {
    // Add error-message-helper class to the parent element initially.
    this.parentElement?.classList.add('error-message-helper');
  }
}
