import { Component, OnInit,Input } from '@angular/core';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.scss']
})
export class PostComponent implements OnInit {
  @Input() content:string;
  @Input() id;
  newComment;
  newPost;
  deleted=false;
  comments=[];
  mod=false;
  constructor() {

   }
  ReloadComments(){
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
  comment(){
    const url='https://127.0.0.1/instertComment.php?post='+this.id+'&content='+'"'+this.newComment+'"';
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    this.ReloadComments();
    this.ReloadComments();
    this.ReloadComments();
    this.newComment="";
    console.log(url);
  }
  modd(){
    const url='https://127.0.0.1/updatePost.php?ID='+this.id+'&content='+'"'+this.newPost+'"';
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    console.log(url);
    this.content=this.newPost;
    this.newPost="";
    this.mod=!this.mod;
  }
  delete(){
    const url='https://127.0.0.1/deletePost.php?ID='+this.id;
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    console.log(url);
    this.deleted=true;
  }
  ngOnInit() {
    this.ReloadComments();
  }

  deleteComment(id: any, newContent: string) {
    const url = `https://127.0.0.1/deleteComments.php?id=${id}`;
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    console.log(url);
  }

  modifyComment(id: any, value: string) {
    console.log(value);
    const url = `https://127.0.0.1/modifyComments.php?id=${id}&newContent='${value}'`;
    const Http = new XMLHttpRequest();
    Http.open("GET", url);
    Http.send();
    console.log(url);
  }
}
