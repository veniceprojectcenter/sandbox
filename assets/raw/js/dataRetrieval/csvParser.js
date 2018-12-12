/**
 * Parses the given CSV file into an array of objects. Each object's keys is determined by the
 * header row, with content indicated by a row
 *
 * @param {File} fileToParse File to parse as a csv
 * @param {function} callback Calls this function with the generated list of items
 */
function parseCSV(fileToParse, callback) {
  const fr = new FileReader();
  fr.onload = (e) => {
    let file = e.target.result;
    file = file.replace(/\r\n/g, '\n');
    file = file.replace(/\r/g, '');
    let lines = file.split('\n');
    lines = lines.filter(item => item !== '');

    if (lines.length < 2) {
      return;
    }

    const keys = lines[0].split(',');
    const items = [];
    for (let i = 1; i < lines.length; i += 1) {
      items.push({});
      const curVals = lines[i].split(',');
      for (let j = 0; j < keys.length; j += 1) {
        items[i - 1][keys[j]] = curVals[j];
      }
    }
    callback(items);
  };
  fr.readAsText(fileToParse);
}

export default parseCSV;
