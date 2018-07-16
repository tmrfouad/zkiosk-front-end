import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../shared/services/account.service';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrls: ['./log-out.component.css']
})
export class LogOutComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<LogOutComponent>,
    private accountSvc: AccountService
  ) { }

  ngOnInit() {
  }

  logOut() {
    this.accountSvc.logout();
    this.dialogRef.close();
  }
}
