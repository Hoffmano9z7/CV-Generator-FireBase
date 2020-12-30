const admin = require('firebase-admin');
const functions = require('firebase-functions');
const pdf = require('html-pdf');
const cors = require('cors')({ origin: true });

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

const headerHtml = (data) => {
  const { brief } = data;
  let result = `
        <div class="header">
            <p class="name"><b>${brief.name}</b></p>
            <span class="brief">
    `;
  Object.keys(brief.info).forEach((key) => {
    result += `
            ${key}: ${brief.info[key]}<br>
        `;
  });
  result += `
        </span>
        </div>
    `;
  return result;
};

const worksHtml = ({ jobs }) => {
  let result = `
    <div class="job">
        <p class="subject">Employment History</p>
        <hr>
    `;
  jobs.reverse();
  jobs.forEach((job) => {
    result += `
            <p><b>${job.firm}</b></p>
            <p><span class="left">${job.title}</span><span class="right">${job.startDate} - ${job.endDate}</span></p><br>
        `;
    job.duty.forEach((point) => {
      result += `
                <li>${point}</li>
            `;
    });
  });
  result += `</div>`;
  return result;
};

const skillsHtml = (data) => {
  const { skill } = data;
  let result = `
        <div class="skill">
            <p class="subject">Programming Skills</p>
            <hr>   
            <table>     
    `;
  skill.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      result += `
                <tr>
                    <td class="key">
                        ${key}
                    </td>
                    <td>
                        ${obj[key].map((subject) => {
                          return subject;
                        })}
                    </td>
                </tr>
            `;
    });
  });

  result += `
        </table>
        </div>
    `;
  return result;
};

const eduHtml = ({ edu }) => {
  let result = `
        <div class="edu">
            <p class="subject">Education & Certificate</p>
            <hr>
    `;
  edu.reverse();
  edu.forEach((info) => {
    result += `
            <p><b>${info.school}</b></p>
            <p><span class="left">${info.title}</span><span class="right">${info.gradDate}</span></p><br>

        `;
  });

  result += '</div>';
  return result;
};

const langHtml = (data) => {
  const { language } = data;
  let result = `
        <div class="lang">
            <p class="subject">Language</p>
            <hr>
            <table>
    `;

  Object.keys(language).forEach((key) => {
    result += `
            <tr>
                <td class="key">${key}</td>
                <td>${language[key]}</td>
            </tr>
        `;
  });

  result += `
            </table>
        </div>
    `;
  return result;
};

const getPdfHtml = (data) => {
  return `
        <html>
            <head>
                <meta charset="utf8">
                <style>
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                    }
                    div {
                        padding-top: 5px;
                    }
                    .header {
                        text-align:center;
                    }
                    .name {
                        font-size: 24;
                        font-weight: border;
                        margin: 2px;
                    }
                    li, p, .brief {
                        font-size: 10;
                    }
                    .left {
                        float: left;
                    }
                    .right {
                        float: right;
                    }
                    .key {
                        width: 100px;
                    }
                    hr {
                        margin-top: 1px;
                    }
                    table, tr, td {
                        border: none;
                        font-size: 10;
                    }
                    .subject{
                        font-size: 16;
                        margin: 5px;
                        margin-bottom: 0px;
                        margin-left : 0px;
                    }
                </style>
            </head>
            <body>
                ${headerHtml(data)}
                ${worksHtml(data)}
                ${skillsHtml(data)}
                <br>
                <br>
                <br>
                ${eduHtml(data)}
                ${langHtml(data)}  
            </body>
        </html>
    `;
};

const options = {
  format: 'A4',
  border: {
    top: '0.5cm',
    right: '1cm',
    bottom: '0.5cm',
    left: '1cm',
  },
};

exports.downloadCV = functions.https.onRequest((req, res) => {
  const { docType } = req.query;
  return cors(req, res, () => {
    return db
      .collection('CV')
      .doc('nboTFKgiZnopZFH5RgCj')
      .get()
      .then((doc) => {
        if (doc.exists) {
          let html = getPdfHtml(doc.data());
          if ('pdf' === docType) {
            return pdf.create(html, options).toStream((err, stream) => {
              if (err) res.status(404).json({ error: 'error!' });
              res.setHeader('Content-type', 'application/pdf');
              return stream.pipe(res);
            });
          }
        }
        return res.status(404).json({ message: 'doc not found' });
      })
      .catch((err) => {
        res.status(404).json({ error: err });
      });
  });
});
