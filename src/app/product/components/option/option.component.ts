import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatChipInputEvent, MatDialogRef } from '@angular/material';

import { Option } from '../../../shared/models/option';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.css']
})
export class OptionComponent implements OnInit {
  new: boolean;
  productId = -1;
  orgOption: Option = {};
  option: Option = {};

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes = [ENTER, COMMA];

  constructor(
    private dialogRef: MatDialogRef<OptionComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { new: boolean, productId: number, option: Option }) { }

  async ngOnInit() {
    this.new = this.data.new;
    this.productId = this.data.productId;
    if (this.data.option) {
      this.option = JSON.parse(JSON.stringify(this.data.option));
      this.orgOption = JSON.parse(JSON.stringify(this.data.option));
    }
  }

  async save() {
    this.option.productId = this.productId;
    this.dialogRef.close({ action: 'save', option: this.option, orgOption: this.orgOption });
  }

  cancel() {
    this.dialogRef.close({ action: 'cancel' });
  }

  addValue(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (!this.option.values) {
        this.option.values = [];
      }
      this.option.values.push({ value: value.trim() });
    }

    if (input) {
      input.value = '';
    }
  }

  removeValue(value: any): void {
    const index = this.option.values.indexOf(value);

    if (index >= 0) {
      this.option.values.splice(index, 1);
    }
  }
}

export interface OptionDialogResult {
  action: string;
  option?: Option;
}
