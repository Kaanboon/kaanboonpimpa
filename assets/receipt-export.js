(() => {
  'use strict';

  const washes = {
    none: [[0, '#fff5d722'], [.1, '#fff5d722'], [.39, '#fff9e8f5'], [.7, '#fffaf0fa'], [1, '#f4e2bcf5']],
    mother: [[0, '#d7eeff66'], [.4, '#fffaf5f2'], [1, '#edf8fcf7']],
    father: [[0, '#fff0bf70'], [.4, '#fffaf0f2'], [1, '#faedc8f7']],
    loy: [[0, '#415d8160'], [.4, '#fffaf0f2'], [1, '#ebeff5f7']],
    newyear: [[0, '#53668460'], [.4, '#fffaf0ef'], [1, '#faeac9f7']],
  };

  function rounded(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  }

  function linear(ctx, x1, y1, x2, y2, stops) {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const [position, color] of stops) gradient.addColorStop(position, color);
    return gradient;
  }

  function radial(ctx, x, y, rx, ry, stops) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(rx, ry);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    for (const [position, color] of stops) gradient.addColorStop(position, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  async function loadBridge(card) {
    const url = getComputedStyle(card).backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1];
    const image = new Image();
    image.src = url || new URL('assets/golden-merit-bridge.png', document.baseURI).href;
    await image.decode();
    return image;
  }

  function paintBackground(ctx, bridge, width, height, festival) {
    const scale = Math.max(width / bridge.naturalWidth, height / bridge.naturalHeight);
    const imageWidth = bridge.naturalWidth * scale;
    const imageHeight = bridge.naturalHeight * scale;
    ctx.drawImage(bridge, (width - imageWidth) / 2, (height - imageHeight) * .25, imageWidth, imageHeight);
    ctx.fillStyle = linear(ctx, 0, 0, 0, height, washes[festival] || washes.none);
    ctx.fillRect(0, 0, width, height);

    if (festival === 'loy') radial(ctx, width * .87, height * .1, width * .09, width * .09, [[0, '#fff1be'], [.25, '#fff1be'], [1, '#fff1be00']]);
    if (festival === 'newyear') radial(ctx, width / 2, height * .16, width * .35, height * .35, [[0, '#fff4c177'], [1, '#fff4c100']]);

    for (const [radius, thickness, color] of [[259, 48, '#fff4b80d'], [242, 25, '#fff4b816'], [230, 1, '#fff7c0a8']]) {
      ctx.beginPath();
      ctx.arc(width / 2, 75, radius, 0, Math.PI * 2);
      ctx.lineWidth = thickness;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    radial(ctx, width / 2, 113, width * .48, 141, [[0, '#ffeb9e80'], [1, '#ffeb9e00']]);
  }

  function paintLotus(ctx, mark) {
    const svg = mark.querySelector('svg');
    const svgStyle = getComputedStyle(svg);
    ctx.save();
    ctx.translate(mark.offsetLeft + mark.offsetWidth / 2, mark.offsetTop + mark.offsetHeight / 2);
    ctx.rotate(-13 * Math.PI / 180);
    ctx.scale(mark.offsetWidth / 100, mark.offsetHeight / 75);
    ctx.translate(-50, -37.5);
    ctx.fillStyle = svgStyle.fill;
    ctx.strokeStyle = svgStyle.stroke;
    ctx.lineWidth = .5;
    for (const part of svg.querySelectorAll('path')) {
      const path = new Path2D(part.getAttribute('d'));
      ctx.fill(path);
      ctx.stroke(path);
    }
    ctx.restore();
  }

  function textLines(element, graphemes) {
    const lines = [];
    const range = element.ownerDocument.createRange();
    for (const node of element.childNodes) {
      if (node.nodeName === 'BR' || node.nodeType !== 3) continue;
      let offset = 0;
      for (const char of graphemes(node.textContent)) {
        range.setStart(node, offset);
        offset += char.length;
        range.setEnd(node, offset);
        if (char === '\n') continue;
        const rect = range.getBoundingClientRect();
        if (!rect.width) continue;
        const last = lines.at(-1);
        if (last && Math.abs(last.top - rect.top) < 2) last.text += char;
        else lines.push({ top: rect.top, text: char });
      }
    }
    return lines;
  }

  function paintText(ctx, element, bounds, art) {
    if (!element || element.hidden || !element.textContent.trim()) return;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const lines = textLines(element, art.graphemes);
    if (!lines.length) return;

    // A zero-height inline block gives the browser's first text baseline.
    const marker = element.ownerDocument.createElement('i');
    marker.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    element.prepend(marker);
    const baseline = marker.getBoundingClientRect().top - bounds.top;
    marker.remove();

    ctx.save();
    ctx.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily;
    ctx.fillStyle = style.color;
    ctx.textBaseline = 'alphabetic';
    if ('letterSpacing' in ctx && style.letterSpacing !== 'normal') ctx.letterSpacing = style.letterSpacing;
    if (element.classList.contains('receipt-name')) {
      ctx.shadowColor = '#fff1ae';
      ctx.shadowBlur = 20;
    }
    for (const line of lines) {
      art.centerText(ctx, line.text.trim(), box.left - bounds.left + box.width / 2, baseline + line.top - lines[0].top, box.width);
    }
    ctx.restore();
  }

  function paintPetals(ctx, width, height) {
    const petals = [
      { x: width * .89 - 9, y: height * .18 + 14, w: 18, h: 29, angle: -30, opacity: .48 },
      { x: width * .07 + 6, y: height * .62 + 10, w: 12, h: 21, angle: -30, opacity: .3 },
      { x: width * .93 - 11, y: height * .92 - 17, w: 22, h: 35, angle: 24, opacity: .48 },
    ];
    for (const { x, y, w, h, angle, opacity } of petals) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle * Math.PI / 180);
      ctx.globalAlpha = opacity;
      ctx.fillStyle = linear(ctx, -w / 2, -h / 2, w / 2, h / 2, [[0, '#f7d5e2'], [1, '#dea1bd']]);
      ctx.beginPath();
      ctx.moveTo(w / 2, -h / 2);
      ctx.bezierCurveTo(-w * .36, -h / 2, -w / 2, h * .16, -w / 2, h / 2);
      ctx.bezierCurveTo(w * .36, h / 2, w / 2, -h * .16, w / 2, -h / 2);
      ctx.fill();
      ctx.restore();
    }
  }

  async function capture() {
    const source = document.querySelector('.receipt-artwork');
    if (!source?.offsetWidth || !source.offsetHeight) throw Error('No visible receipt');
    const art = window.KBMeritCard;
    const panel = document.createElement('section');
    panel.className = 'receipt-panel receipt-export-panel';
    panel.setAttribute('aria-hidden', 'true');
    const card = source.cloneNode(true);
    card.classList.add('receipt-export');
    for (const element of card.querySelectorAll('[id]')) element.removeAttribute('id');
    panel.append(card);
    document.body.append(panel);

    try {
      const logo = card.querySelector('.receipt-scenery img');
      const [bridge] = await Promise.all([loadBridge(card), logo.decode(), art.readyFonts()]);
      const bounds = card.getBoundingClientRect();
      const { width, height } = bounds;
      const canvas = document.createElement('canvas');
      const ratio = 2;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext('2d');
      ctx.scale(ratio, ratio);
      ctx.save();
      rounded(ctx, 0, 0, width, height, 22);
      ctx.clip();
      paintBackground(ctx, bridge, width, height, document.body.dataset.festival);

      const logoBox = logo.getBoundingClientRect();
      const scale = Math.min(logoBox.width / logo.naturalWidth, logoBox.height / logo.naturalHeight);
      const logoWidth = logo.naturalWidth * scale;
      const logoHeight = logo.naturalHeight * scale;
      ctx.globalCompositeOperation = 'multiply';
      ctx.drawImage(logo, logoBox.left - bounds.left + (logoBox.width - logoWidth) / 2,
        logoBox.top - bounds.top + (logoBox.height - logoHeight) / 2, logoWidth, logoHeight);
      ctx.globalCompositeOperation = 'source-over';
      paintLotus(ctx, card.querySelector('.receipt-mark'));

      const motto = card.querySelector('.receipt-scenery span');
      const badge = motto.getBoundingClientRect();
      rounded(ctx, badge.left - bounds.left, badge.top - bounds.top, badge.width, badge.height, badge.height / 2);
      ctx.fillStyle = '#fff8dfb3';
      ctx.fill();

      const summary = card.querySelector('.receipt-summary').getBoundingClientRect();
      const left = summary.left - bounds.left, top = summary.top - bounds.top;
      ctx.fillStyle = linear(ctx, left, 0, left + summary.width, 0, [[0, '#fff8e400'], [.5, '#fff8e4b0'], [1, '#fff8e400']]);
      ctx.fillRect(left, top, summary.width, summary.height);
      ctx.fillStyle = '#d4b77a80';
      ctx.fillRect(left, top, summary.width, 1);
      ctx.fillRect(left, top + summary.height - 1, summary.width, 1);

      for (const selector of ['.receipt-scenery span', '.festival-card-badge', '.panel-kicker', 'h2', '.receipt-name', '.receipt-gift-caption', '.receipt-summary', '.receipt-blessing']) {
        paintText(ctx, card.querySelector(selector), bounds, art);
      }
      paintPetals(ctx, width, height);

      ctx.globalCompositeOperation = 'screen';
      radial(ctx, width / 2, height / 2, width * .36, height * .36, [[0, '#fff7ca30'], [1, '#fff7ca00']]);
      ctx.restore();
      rounded(ctx, 3.5, 3.5, width - 7, height - 7, 19);
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#fff5d16b';
      ctx.stroke();
      rounded(ctx, .5, .5, width - 1, height - 1, 22);
      ctx.lineWidth = 1;
      ctx.strokeStyle = getComputedStyle(card).borderTopColor;
      ctx.stroke();
      rounded(ctx, 10.5, 10.5, width - 21, height - 21, 15);
      ctx.strokeStyle = '#b9944d66';
      ctx.stroke();
      return canvas;
    } finally {
      panel.remove();
    }
  }

  window.KBReceiptExport = { capture };
})();
