
class ColorHelper {
  /**
   * Returns whether or not the color is light (light colors contrast better on black, dark contrast
   * better on white)
   *
   * @param color Hexcode color to examime
   * @returns {boolean} True if the color is light based on W3C recommendations
   */
  static isLight(color) {
    const parsedColor = [parseInt(color.substring(1, 3), 16), parseInt(color.substring(3, 5), 16),
      parseInt(color.substring(5, 7), 16)];
    const luminances = parsedColor.map((rgb) => {
      const c = rgb / 255;
      if (c <= 0.03928) {
        return c / 12.92;
      } else {
        return ((c + 0.055) / 1.055) ** 2;
      }
    });
    return (luminances[0] * 0.2126) + (luminances[1] * 0.7152) + (luminances[2] * 0.0722) > 0.179;
  }


  /**
   * Generates a value in a color gradient a hexcode string
   *
   * @param {number} pos Percent of the way through the gradient that the current value is
   *                     positioned
   * @param {String} from = '#FFFFFF' Hexcode value for start color
   * @param {String} to = '#000000' Hexcode value for end color
   *
   * @return {String} Hexcode color of current step
   */
  static gradientValue(pos, from = '#FFFFFF', to = '#000000') {
    if (!pos) {
      return from;
    }
    const start = [parseInt(from.substring(1, 3), 16), parseInt(from.substring(3, 5), 16),
      parseInt(from.substring(5, 7), 16)];
    const end = [parseInt(to.substring(1, 3), 16), parseInt(to.substring(3, 5), 16),
      parseInt(to.substring(5, 7), 16)];
    const curr = [];
    for (let i = 0; i < 3; i += 1) {
      let dif = end[i] - start[i];
      let realPos = pos;
      let realStart = start[i];
      if (dif < 0) {
        dif *= -1;
        realPos = 1 - realPos; // flip direction
        realStart = end[i];
      }
      const trueColor = (dif * realPos) + realStart;
      curr.push(Math.floor(trueColor));
    }
    return this.rgbToHex(`rgb(${curr[0]},${curr[1]},${curr[2]})`);
  }

  /**
   * Creates a gradient between two colors and returns an array of hexcode strings
   *
   * @param {int} number Number of steps in the gradient creation
   * @param {String} from = '#FFFFFF' Hexcode value for start color
   * @param {String} to = '#000000' Hexcode value for end color
   *
   * @return {String[]} Array of all hexcode color steps
   */
  static createGradient(number, from = '#FFFFFF', to = '#000000') {
    if (number < 1) {
      return [];
    } else if (number === 1) {
      return [from];
    } else if (number === 2) {
      return [from, to];
    }
    const hexcodes = [];
    for (let i = 0; i < number; i += 1) {
      hexcodes.push(this.gradientValue(i / (number - 1), from, to));
    }
    return hexcodes;
  }

  static componentToHex(c) {
    const hex = c.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }

  /**
   * Converts a string of an rgb value to a color hexcode
   * @param {String} rgb Color value in RGB that is formatted like 'rgb(r,g,b)' with r, g, and b
   *                     being base10 integers between 0 and 255
   * @returns {string} hexcode for color in the format '#rrggbb'
   */
  static rgbToHex(rgb) {
    let a = rgb.replace(' ', '').split('(')[1].split(')')[0];
    a = a.split(',');
    const b = a.map((x) => {             // For each array element
      const base16 = parseInt(x, 10).toString(16);      // Convert to a base16 string
      return (base16.length === 1) ? `0${base16}` : base16;  // Add zero if we get only one character
    });
    return `#${b.join('')}`;
  }
}
export default ColorHelper;
