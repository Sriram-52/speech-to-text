import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { io, Socket } from 'socket.io-client';
import { AudioStreamer } from 'src/app/app.service';
import { FormType } from 'src/types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'live-speech';
  socket: Socket | undefined;
  interviewStarted: boolean = false;
  liveTranscription: string;
  isRecording: boolean = false;
  firstRecording: boolean = true;
  @ViewChild('editableDiv') editableDiv!: ElementRef<HTMLDivElement>;
  editorMode: 'view' | 'edit' = 'view';
  form: FormGroup<FormType>;

  constructor(private audioStreamer: AudioStreamer) {
    this.liveTranscription = '';
    this.socket = io('http://localhost:8080');
    this.socket.on('connect', () => {
      console.log('Socket Connection: ', this.socket?.connected);
    });
    this.audioStreamer._socket = this.socket;
    //Create a reactive Form with input textarea
    this.form = new FormGroup({
      text: new FormControl(''),
    });
  }
  ngOnInit() {
    console.log('Component Init');
  }
  async startInterview() {
    this.interviewStarted = true;
  }

  muteTTS() {
    // if (this.isTTS == true) {
    //   this.isTTS = false;
    // }
  }

  toggleEdit() {
    if (this.editorMode == 'view' && this.liveTranscription != '') {
      this.form.get('text')?.setValue(this.liveTranscription);
    }
    this.editorMode == 'view'
      ? (this.editorMode = 'edit')
      : (this.editorMode = 'view');
    console.log(this.editorMode);
    //If liveTranscription is not empty, copy it to the form text
  }

  toggleRecording() {
    this.firstRecording = false;
    this.isRecording ? this.stopRecording() : this.startRecording();
  }

  startRecording() {
    console.log('startRecording');
    if (!this.isRecording) {
      this.liveTranscription = '';
    }
    this.isRecording = true;
    this.audioStreamer.initRecording(
      ({ data }: { data: string }) => {
        console.log({ data });
        this.liveTranscription += data + '. ';
      },
      (error) => {
        console.error(error);
        console.error('Error when processing audio');
      }
    );
  }
  stopRecording() {
    this.isRecording = false;
    console.log('stopRecording');
    this.audioStreamer.stopRecording();
  }
}
