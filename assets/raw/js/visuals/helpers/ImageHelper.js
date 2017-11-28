class ImageHelper {
  static async urlToBase64(url) {
    let response = null;
    await fetch(url).then((value) => {
      response = value;
    });
    const blob = await response.blob();
    const promise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });

    let encodedURL = '';
    await promise.then((result) => {
      encodedURL = result;
    });

    return encodedURL;
  }
}

export default ImageHelper;
