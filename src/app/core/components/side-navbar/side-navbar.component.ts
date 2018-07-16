import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../shared/services/account.service';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrls: ['./side-navbar.component.css']
})
export class SideNavbarComponent implements OnInit {

  constructor(public accountSvc: AccountService) { }

  ngOnInit() {
  }

}
