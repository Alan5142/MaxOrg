import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-posts-section',
  templateUrl: './posts-section.component.html',
  styleUrls: ['./posts-section.component.scss']
})
export class PostsSectionComponent implements OnInit {
  posts=JSON.parse('[{"ID":"1","contenido":"hubofalla"}]');
  newContent="";
  constructor() {
    this.Reload();    
   }

  ngOnInit() {
  }
  Reload(){
    const Http = new XMLHttpRequest();
    const url='https://127.0.0.1/selectPost.php?subgroup=1';
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=(e)=>{
      this.posts=JSON.parse(Http.responseText);
      console.log("reload Finished");
    }
  }
  onClick(){
    const url='https://127.0.0.1/instertPost.php?subgroup=1&&content='+'"'+this.newContent+'"';
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    this.Reload();
    this.Reload();
    this.Reload();
    this.newContent="";
   
  }
}
