import {Component, OnInit} from '@angular/core';
import {User, UserService} from "../../services/user.service";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";

@Component({
  selector: 'app-user-view',
  templateUrl: './user-view.component.html',
  styleUrls: ['./user-view.component.scss']
})
export class UserViewComponent implements OnInit {
  user: Observable<User>;

  constructor(private userService: UserService,
              private route: ActivatedRoute) {
    this.route.params.subscribe(p => {
      this.user = this.userService.getUser(p['userId']);
    })
  }

  ngOnInit() {
  }

}
