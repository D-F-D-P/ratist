import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';
import { AppService } from '../app.service'


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  suggestedFriends;
  
  id = '';
  followers = [];
  following = [];
  name = '';
  status = '';
  section = 'activity';
  rate = 0.0;
  posts = [];
  activityLog = [];
  popup = false;
  popupArr = [];
  indexcolors = [
        "#000000", "#FFFF00", "#1CE6FF", "#FF34FF", "#FF4A46", "#008941", "#006FA6", "#A30059",
        "#FFDBE5", "#7A4900", "#0000A6", "#63FFAC", "#B79762", "#004D43", "#8FB0FF", "#997D87",
        "#5A0007", "#809693", "#FEFFE6", "#1B4400", "#4FC601", "#3B5DFF", "#4A3B53", "#FF2F80",
        "#61615A", "#BA0900", "#6B7900", "#00C2A0", "#FFAA92", "#FF90C9", "#B903AA", "#D16100",
        "#DDEFFF", "#000035", "#7B4F4B", "#A1C299", "#300018", "#0AA6D8", "#013349", "#00846F",
        "#372101", "#FFB500", "#C2FFED", "#A079BF", "#CC0744", "#C0B9B2", "#C2FF99", "#001E09",
        "#00489C", "#6F0062", "#0CBD66", "#EEC3FF", "#456D75", "#B77B68", "#7A87A1", "#788D66",
        "#885578", "#FAD09F", "#FF8A9A", "#D157A0", "#BEC459", "#456648", "#0086ED", "#886F4C",

        "#34362D", "#B4A8BD", "#00A6AA", "#452C2C", "#636375", "#A3C8C9", "#FF913F", "#938A81",
        "#575329", "#00FECF", "#B05B6F", "#8CD0FF", "#3B9700", "#04F757", "#C8A1A1", "#1E6E00",
        "#7900D7", "#A77500", "#6367A9", "#A05837", "#6B002C", "#772600", "#D790FF", "#9B9700",
        "#549E79", "#FFF69F", "#201625", "#72418F", "#BC23FF", "#99ADC0", "#3A2465", "#922329",
        "#5B4534", "#FDE8DC", "#404E55", "#0089A3", "#CB7E98", "#A4E804", "#324E72", "#6A3A4C",
        "#83AB58", "#001C1E", "#D1F7CE", "#004B28", "#C8D0F6", "#A3A489", "#806C66", "#222800",
        "#BF5650", "#E83000", "#66796D", "#DA007C", "#FF1A59", "#8ADBB4", "#1E0200", "#5B4E51",
        "#C895C5", "#320033", "#FF6832", "#66E1D3", "#CFCDAC", "#D0AC94", "#7ED379", "#012C58"
];

  profileSubscription: Subscription;
  LogSubscription: Subscription;

  constructor(private route: ActivatedRoute, private appService: AppService) { }

  updateSuggestions() {
    this.updateView(this.id || this.route.snapshot.params.id);
    this.suggestedFriends = this.appService.suggestedFriends;
  }

  updateView(id){
    this.appService.getProfile(id).subscribe((response)=>{
        this.popup = false;
        this.section = 'activity';
        this.followers = response.followers;
        this.following = response.following;
        this.name = response.name;
        this.status = response.status;
        this.id = id;
        let i = 0;
        this.posts = response.posts;
        this.rate = response.posts.reduce((aggr, cur)=>{
          return aggr + cur.rates.reduce((aggr, cur)=>{
            i++;
            return aggr + cur.value;
          },0)
        },0) / i;
      })
  }

  showPopup(arr){
    if(arr.length > 0){
      this.popupArr = arr
      this.popup = true;
    }
  }

  hidePopup(){
    this.popup = false;
  }

  ngOnInit() {
    this.updateSuggestions();
    this.appService.suggestedFriendsSubject.subscribe(()=>{
      this.updateSuggestions();
    });
  	this.profileSubscription = this.route.queryParams.subscribe(params=>{
      console.log("yes", params["id"]);
      this.updateView(params["id"]);
    })
    this.LogSubscription = this.appService.activityLogSubject.subscribe(()=>{
      this.activityLog = this.appService.activityLog;
    })
  }

  removePost(id) {
    this.appService.removePost(id).subscribe(()=>this.updateView(this.id));
  }

  sharePost(id) {
    this.appService.sharePost(id).subscribe(()=>this.updateView(this.id));
  }

  addComment(id, body) {
    this.appService.addComment(id, body).subscribe(()=>this.updateView(this.id));
  }

  likePost(id) {
    this.appService.likePost(id).subscribe(()=>this.updateView(this.id));
  }

  unlikePost(id) {
    this.appService.unlikePost(id).subscribe(()=>this.updateView(this.id));
  }

  addPost(body) {
    this.appService.addPost(body).subscribe(()=>this.updateView(this.id));
  }

  removeComment(id) {
    this.appService.removeComment(id).subscribe(()=>this.updateView(this.id));
  }

  follow(id) {
    this.appService.follow(id).subscribe(()=>this.updateSuggestions());
  }

  unfollow(id) {
    this.appService.unfollow(id).subscribe(()=>this.updateSuggestions());
  }

  checkLike(arr) {
    for (var i = 0; i < arr.length; i++) {
      if(this.compare(arr[i].user_id))return true;
    }
    return false;
  }

  compare(id) {
    if(id == this.appService.id){
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('id');
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  ngOnDestroy(){
    this.profileSubscription.unsubscribe();
  	this.LogSubscription.unsubscribe();
  }

}
