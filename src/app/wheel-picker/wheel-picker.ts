import {
  afterNextRender,
  Component,
  ElementRef,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-wheel-picker',
  templateUrl: './wheel-picker.html',
  styleUrl: './wheel-picker.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WheelPicker),
      multi: true,
    },
  ],
})
export class WheelPicker implements ControlValueAccessor {
  options = input.required<string[]>();
  disabled = input(false);
  ariaLabel = input('Select value');

  wheel = viewChild<ElementRef<HTMLElement>>('wheel');

  readonly itemHeight = 40;
  selectedIndex = signal(0);

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
  private isProgrammaticScroll = false;

  constructor() {
    afterNextRender(() => this.scrollToIndex(this.selectedIndex(), false));
  }

  writeValue(value: string | null): void {
    const index = this.options().indexOf(value ?? '');
    this.selectedIndex.set(index >= 0 ? index : 0);
    this.scrollToIndex(this.selectedIndex(), false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {}

  onWheelScroll(event: Event) {
    if (this.disabled()) return;

    const container = event.target as HTMLElement;
    const index = this.indexFromScrollTop(container.scrollTop);
    if (index !== this.selectedIndex()) {
      this.selectedIndex.set(index);
      this.emitSelection();
    }

    if (this.scrollEndTimer) {
      clearTimeout(this.scrollEndTimer);
    }

    this.scrollEndTimer = setTimeout(() => {
      this.snapToIndex(container, this.selectedIndex());
      this.onTouched();
    }, 80);
  }

  private emitSelection() {
    const value = this.options()[this.selectedIndex()];
    if (value !== undefined) {
      this.onChange(value);
    }
  }

  private indexFromScrollTop(scrollTop: number): number {
    const maxIndex = Math.max(0, this.options().length - 1);
    return Math.max(0, Math.min(Math.round(scrollTop / this.itemHeight), maxIndex));
  }

  private scrollToIndex(index: number, smooth: boolean) {
    const container = this.wheel()?.nativeElement;
    if (!container) return;

    this.isProgrammaticScroll = true;
    container.scrollTo({
      top: index * this.itemHeight,
      behavior: smooth ? 'smooth' : 'instant',
    });
    requestAnimationFrame(() => {
      this.isProgrammaticScroll = false;
    });
  }

  private snapToIndex(container: HTMLElement, index: number) {
    if (this.isProgrammaticScroll) return;

    this.isProgrammaticScroll = true;
    container.scrollTo({
      top: index * this.itemHeight,
      behavior: 'smooth',
    });
    requestAnimationFrame(() => {
      this.isProgrammaticScroll = false;
    });
  }
}
