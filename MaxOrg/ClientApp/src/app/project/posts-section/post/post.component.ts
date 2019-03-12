import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @Input() content:string;
  @Input() id;
  newContent;
  comments=[];
  constructor() {
    
   }
  Reload(){
    const Http = new XMLHttpRequest();
    const url='https://127.0.0.1/selectComments.php?post='+this.id;
    console.log(url);
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange=(e)=>{
      this.comments=JSON.parse(Http.responseText);
      console.log("reload comments Finished");
    }
  }
  onClick(){
    const url='https://127.0.0.1/instertComment.php?post='+this.id+'&&content='+'"'+this.newContent+'"';
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    this.Reload();
    this.Reload();
    this.Reload();
    this.newContent="";
    console.log(url);
  }
  ngOnInit() {
    this.Reload();
  }

}
