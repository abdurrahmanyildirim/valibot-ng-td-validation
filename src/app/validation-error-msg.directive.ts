import {
  afterRenderEffect,
  computed,
  Directive,
  inject,
  ViewContainerRef,
} from '@angular/core';
import { NgModel } from '@angular/forms';
import { ValidationDirective } from './validation.directive';
import { MatTooltip } from '@angular/material/tooltip';
import { sanitizePathToClass } from './util';

@Directive({
  selector: '[validationErrorMsg]',
  hostDirectives: [MatTooltip],
})
export class ValidationErrorMsgDirective {
  private readonly ngModel = inject(NgModel);
  private readonly tooltip = inject(MatTooltip);
  private readonly validationDirective = inject(ValidationDirective);
  private readonly viewContainerRef = inject(ViewContainerRef);

  // private readonly inputPath = computed(() => this.ngModel.path.join('.'));
  private readonly inputPath = computed(() =>
    Array.isArray(this.ngModel?.path) ? this.ngModel.path.join('.') : ''
  );

  private readonly errMsg = computed(
    () => this.validationDirective.errorMap()[this.inputPath()]
  );

  private readonly fieldElement = this.getFieldElement(
    this.viewContainerRef.element.nativeElement
  );

  private readonly errorMsgEffect = afterRenderEffect(() => {
    const messages = this.errMsg();
    const el: HTMLElement = this.viewContainerRef.element.nativeElement;
    const fieldElement = this.fieldElement ?? this.getFieldElement(el);

    this.tooltip.position = 'above';

    if (messages?.length) {
      el.classList.add('invalid-input');
      // Add path to field as class. It will be used to focus on the field
      el.classList.add(sanitizePathToClass(this.inputPath()));
      this.tooltip.message = messages[0]; // or join messages if you want
      if (fieldElement) {
        fieldElement.setAttribute('data-error', messages[0]);
      }
    } else {
      el.classList.remove('invalid-input');
      el.classList.remove(sanitizePathToClass(this.inputPath()));
      this.tooltip.message = '';
      if (fieldElement) {
        fieldElement.removeAttribute('data-error');
      }
    }
  });

  private getFieldElement(elem: HTMLElement): HTMLElement {
    if (elem.classList.contains('field')) {
      return elem;
    }
    if (!elem.parentElement) {
      return elem;
    }
    return this.getFieldElement(elem.parentElement);
  }
}
