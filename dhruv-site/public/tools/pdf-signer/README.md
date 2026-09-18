# Signing Desk

A single-page tool for signing and annotating PDFs in the browser.

**Your document never leaves your machine.** The file is read with `FileReader`, edited in memory, and written back out as a `Blob` download. There is no server, no upload, and no network request of any kind after the page itself has loaded. You can verify this by opening `index.html` from disk with your network turned off.

## What it does

- Draw a signature with a mouse, trackpad or touchscreen, or type one in a script face
- Drag a box anywhere on a page to place the signature
- Add text boxes with adjustable size and colour, written as real PDF text so it stays selectable and searchable
- Export a trimmed, transparent-background PNG of your signature for use in other tools
- Move, select and remove anything you have placed, with undo
- Handles multi-page, rotated and scanned documents

## What it is not

This adds your signature as part of the page, which is the equivalent of signing a printout. It is **not** a cryptographic digital signature (PKCS#7) and it will not produce the verified-signature banner you see in Acrobat. If you need a counterparty to cryptographically verify who signed a document, you want a proper signing tool such as [pyHanko](https://github.com/MatthiasValvekens/pyHanko) and a certificate from a CA in Adobe's Approved Trust List.

## Running it

Open `index.html`. That is the whole install.

It works from the filesystem, from any static host, or from GitHub Pages. Everything it depends on is in `vendor/`, so it runs fully offline.

## Keyboard

| | |
| --- | --- |
| `V` / `S` / `T` | Select, Signature and Text tools |
| `Cmd/Ctrl` + `O` | Open a document |
| `Cmd/Ctrl` + `S` | Save the signed document |
| `Cmd/Ctrl` + `Z` | Undo |
| `Delete` | Remove the selected item |
| `Escape` | Deselect, or finish editing a text box |

## Browser support

Any current version of Chrome, Edge, Firefox or Safari. It uses Pointer Events, `File.arrayBuffer()` and CSS custom properties, so Internet Explorer and pre-2020 browsers are out of scope.

## Structure

```
index.html                     the entire application
vendor/pdf.min.js              PDF.js, renders pages to a canvas
vendor/pdf.worker.min.js       PDF.js worker (required by the above)
vendor/pdf-lib.min.js          pdf-lib, writes the output file
```

## Licence

This project is MIT licensed. See [LICENSE](LICENSE).

It redistributes two libraries, whose licences are reproduced in full under `vendor/` and summarised in [NOTICE](NOTICE):

- [PDF.js](https://github.com/mozilla/pdf.js) by Mozilla, Apache License 2.0
- [pdf-lib](https://github.com/Hopding/pdf-lib) by Andrew Dillon, MIT License
