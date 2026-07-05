import { Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { WheelPicker } from '../wheel-picker/wheel-picker';

@Component({
  selector: 'app-reminder-datetime-picker',
  imports: [FormsModule, WheelPicker],
  templateUrl: './reminder-datetime-picker.html',
  styleUrl: './reminder-datetime-picker.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReminderDatetimePicker),
      multi: true,
    },
  ],
})
export class ReminderDatetimePicker implements ControlValueAccessor {
  disabled = input(false);

  readonly hourOptions = Array.from({ length: 24 }, (_, hour) => String(hour).padStart(2, '0'));
  readonly minuteOptions = Array.from({ length: 60 }, (_, minute) => String(minute).padStart(2, '0'));

  dateValue = signal('');
  hourValue = signal('12');
  minuteValue = signal('00');

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    if (!value) {
      this.applyDefaultValues();
      return;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      this.applyDefaultValues();
      return;
    }

    const pad = (part: number) => String(part).padStart(2, '0');
    this.dateValue.set(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
    this.hourValue.set(pad(date.getHours()));
    this.minuteValue.set(pad(date.getMinutes()));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(_isDisabled: boolean): void {}

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dateValue.set(input.value);
    this.emitValue();
  }

  onHourChange(hour: string) {
    this.hourValue.set(hour);
    this.emitValue();
  }

  onMinuteChange(minute: string) {
    this.minuteValue.set(minute);
    this.emitValue();
  }

  private applyDefaultValues() {
    const date = new Date();
    date.setMinutes(0, 0, 0);
    date.setHours(date.getHours() + 1);

    const pad = (part: number) => String(part).padStart(2, '0');
    this.dateValue.set(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
    this.hourValue.set(pad(date.getHours()));
    this.minuteValue.set('00');
  }

  private emitValue() {
    if (!this.dateValue()) return;

    const composed = `${this.dateValue()}T${this.hourValue()}:${this.minuteValue()}`;
    this.onChange(composed);
    this.onTouched();
  }
}
