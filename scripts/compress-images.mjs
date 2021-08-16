import fs from 'fs';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import imageminWebp from 'imagemin-webp';

function updateContentFileImageNames() {
  const contentFile = 'dist/rubic/assets/content/content.json';

  fs.readFile(contentFile, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    const result = data.replace(/("img": ?"[a-zA-Z_]+)(\.jpg|\.png)"/g, '$1.webp"');
    fs.writeFile(contentFile, result, 'utf8', function (err) {
      if (err) {
        return console.log(err);
      }
    });
  });
}

imagemin(['dist/rubic/assets/images/team/*.{jpg,png}'], {
  destination: 'dist/rubic/assets/images/tmp',
  plugins: [
    imageminJpegtran(),
    imageminPngquant({
      quality: [0.6, 0.8]
    }),
    imageminWebp({ quality: 50 })
  ]
}).then(() => {
  fs.rmdirSync('dist/rubic/assets/images/team', { recursive: true });
  fs.renameSync('dist/rubic/assets/images/tmp', 'dist/rubic/assets/images/team');
  updateContentFileImageNames();
});
