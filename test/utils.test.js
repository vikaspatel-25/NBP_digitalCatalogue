import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

function extractPublicId(url) {
  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let publicPath = url.substring(uploadIndex + 8);
    publicPath = publicPath.replace(/^v\d+\//, "");
    const withoutExt = publicPath.replace(/\.[^/.]+$/, "");
    return withoutExt;
  } catch {
    return null;
  }
}

describe('Utilities & Helper Logic', () => {

  describe('extractPublicId', () => {
    test('extracts clean public_id from standard Cloudinary image URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v1612345678/sample_folder/my_image.jpg';
      const id = extractPublicId(url);
      assert.equal(id, 'sample_folder/my_image');
    });

    test('extracts public_id when no subfolders exist', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/v123456/direct_image.png';
      const id = extractPublicId(url);
      assert.equal(id, 'direct_image');
    });

    test('extracts public_id from video Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/demo/video/upload/v1700000000/product_videos/demo.mp4';
      const id = extractPublicId(url);
      assert.equal(id, 'product_videos/demo');
    });

    test('returns null for non-Cloudinary or malformed URLs', () => {
      assert.equal(extractPublicId('https://example.com/images/cat.jpg'), null);
      assert.equal(extractPublicId(''), null);
      assert.equal(extractPublicId('/local/static/path.png'), null);
    });
  });

  describe('Static Assets Verification', () => {
    test('placeholder.png asset exists in public/images', async () => {
      const fs = await import('fs');
      const path = await import('path');
      const placeholderPath = path.resolve('public/images/placeholder.png');
      assert.ok(fs.existsSync(placeholderPath), 'public/images/placeholder.png must exist');
      const stat = fs.statSync(placeholderPath);
      assert.ok(stat.size > 0, 'placeholder.png must not be empty');
    });
  });

});
