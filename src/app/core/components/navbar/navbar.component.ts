import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { AccountService } from '../../../shared/services/account.service';
import { LogOutComponent } from '../log-out/log-out.component';
import { validateConfig } from '@angular/router/src/config';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    public accountSvc: AccountService
  ) { }

  ngOnInit() {
  }

  openLogOutDialog() {
    this.dialog.open(LogOutComponent);
  }
}
