
import { defineStore } from 'pinia'
import Utils from "@/utils/";
import $ from 'jquery';
export const imagesUpload = defineStore("imagesUpload", {

  state: () => ({
    data_import:[],
    isLoad:false,
    uploadStatus:{success:false,msg:""}
  })
  ,
  actions: {
  async setDataImport(data){
    data.forEach(ele => {
      this.data_import.push(ele);
    });
  
    console.log(this.data_import)
    this.upLoadImage();
  },
  async upLoadImage() {
    let v = this;
    if(this.data_import.length > 0 && !this.isLoad){
      this.isLoad = true;
      let ele = this.data_import[0];
      if(ele.name == undefined){
        ele.name = Utils.newGuid("")
      }
      let newFilex = new File([ele.objectURL], ele.name, {
        type: "image/png",
      });
      newFilex.cmd = ele.cmd;
      newFilex.objectURL = URL.createObjectURL(ele.objectURL);
      var file = newFilex;
      var reader = new FileReader();
      reader.onload = function (readerEvent) {
        var image = new Image();
        image.onload = function (imageEvent) {
          // Resize the image
          var canvas = document.createElement("canvas"),
            max_size = 1280, // TODO : pull max size from a site config
            width = image.width,
            height = image.height;
          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(image, 0, 0, width, height);
          var dataUrl = canvas.toDataURL("image/jpeg");
          var resizedImage = v.dataURLToBlob(dataUrl);
          $.event.trigger({
            type: "imageResized",
            blob: resizedImage,
            url: dataUrl,
          });

          var newfile = v.createFile(resizedImage, ele);
          console.log(ele);
          console.log(newfile);
          ele = newfile;
          
          v.data_import.splice(0,1);

          v.isLoad = false;

          v.uploadStatus = {success:true,msg:ele.name+" success"}

          console.log(v.uploadStatus)
          console.log(v.data_import)
          if(v.data_import.length>0){
            v.upLoadImage()
          }
          
 
          // MasterdataService.upLoadDocImages(newfile, "GL")
          //   .then((res) => {
          //     console.log(res);
          //     if (res.success) {
          //           this.data_import.value = [];
          //     }
          //   })
          //   .catch((err) => {
          //     console.log(err);
          //   });
        };
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);

  }
},
createFile(image, file) {
  // let newFile = {
  //   cmd: file.cmd,
  //   name: file.name,
  //   objectURL: URL.createObjectURL(image),
  //   size: image.size,
  //   type: file.type,
  //   lastModifiedDate: file.lastModifiedDate,
  //   lastModified: file.lastModified,
  // };
  let newFile = new File([image], file.name, {
    type: "image/png",
  });
  newFile.cmd = file.cmd;
  newFile.objectURL = URL.createObjectURL(image);
  return newFile;
},
dataURLToBlob(dataURL) {
  var BASE64_MARKER = ";base64,";
  if (dataURL.indexOf(BASE64_MARKER) == -1) {
    var parts = dataURL.split(",");
    var contentType = parts[0].split(":")[1];
    var raw = parts[1];

    return new Blob([raw], { type: contentType });
  }

  var parts = dataURL.split(BASE64_MARKER);
  var contentType = parts[0].split(":")[1];
  var raw = window.atob(parts[1]);
  var rawLength = raw.length;

  var uInt8Array = new Uint8Array(rawLength);

  for (var i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}
  
  },
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths:["data_import"]
      },
    ],
  }
});
