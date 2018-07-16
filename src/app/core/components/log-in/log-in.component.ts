import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../../shared/services/account.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {
  email: string;
  password: string;

  constructor(
    private accountSvc: AccountService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
  }

  inputKeyUp(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.login();
    }
  }

  async login() {
    const user = {
      'Email': this.email,
      'Password': this.password
    };
    const token$ = await this.accountSvc.login(user.Email, user.Password);

    token$.subscribe(userToken => {
      localStorage.setItem('userToken', userToken.toString());
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      this.router.navigate([returnUrl || '/']);
    }, error => {
      throw error;
    });

  }

}
