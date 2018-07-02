
function build_menu(text) {
  let lines = text.trim().split(/\s*\n\s*/)

  links = []

  for (line of lines) {
    links.push('<a class="animated fadeIn" href="' + encodeURI(line) + '">' + line + '</a><br>')
  }

  return links.join('')
}

function load_menu() {
  fetch('poetry/enabled.txt').then(function(response) {
    if (response.ok == true) {
      response.text().then(function (text) {
        var menu_html = build_menu(text)
        save_location("")
        document.getElementById('mainmenucontent').innerHTML = menu_html
        document.title = "Poetry Illustrated"
        hook_menu_links()
        goto_menu()
      })
    }
  })
}

function hook_menu_links() {
  let links = document.getElementById('mainmenucontent').getElementsByTagName('a')
  for (link of links) {
    link.addEventListener('click', function(e) {
      let name = decodeURI(e.target.getAttribute('href'))
      save_location(name)
      load_poem(name)
      e.preventDefault()
      return false
    }, false);
  }
}

function hook_back_links() {
  let links = document.getElementById('stage').getElementsByClassName('back-button')
  for (link of links) {
    link.addEventListener('click', function(e) {
      window.location.hash = ""
      goto_menu(name)
      e.preventDefault()
      return false
    }, false);
  }
}

function load_poem(name) {
  let base_url = 'poetry/' + name
  fetch(base_url + '/poem.txt?t=' + Math.floor(Date.now() / 1000)).then(function(response) {
    if (response.ok == true) {
      response.text().then(function (text) {
        var poem_html = build_poem(text, base_url)
        document.title = "Poetry Illustrated - " + name
        document.getElementById('stage').innerHTML = poem_html
        hook_back_links()
        goto_poem()
      })
    }
  })
}

function goto_poem() {
  console.log(document.getElementById('mainmenu'))
  document.getElementById('mainmenu').style.display = 'none';
  document.getElementById('stage').style.display = 'block';
}

function goto_menu() {
  document.getElementById('stage').style.display = 'none';
  document.getElementById('mainmenu').style.display = 'block';
}

function render_title(bit) {
  return '<div class="animated fadeIn title">' + escapeHtml(bit.replace(/#/g, '')) + '</div>'
}

function render_credit(bit) {
  let lines = bit.trim().split(/\s*\n\s*/)
  let output = []
  for (let line of lines) {
    line = line.replace(/>>/g, '')
    output.push('<span class="animated fadeIn">' + escapeHtml(line) + '</span>')
  }
  return '<div class="animated fadeIn credits">' + output.join('<br>') + '</div>'
}

function render_part(bit) {
  let lines = bit.trim().split(/\s*\n\s*/)
  let output = []
  for (let line of lines) {
    output.push('<span class="animated fadeIn">' + escapeHtml(line) + '</span>')
  }
  return '<div class="stanza">' + output.join('<br>') + '</div>'
}

function render_section_start(bit) {
  let tag = '<div class="section"'
  if (bit) {
    tag += ' style="background-image:url(\'' + encodeURI(bit) + '\')">'
  } else {
    tag += '>'
  }
  return tag
}
function render_section_end() {
  return '</div>'
}
function render_back_button() {
  return '<a class="animated fadeIn back-button" href="#">Back to menu</a><br>'
}

// Function: parse_sections
// changes poem text into a json structure
function build_poem(text, base_url) {
  // firstly split into sections after getting rid of whitespace at start and end
  let sections = text.trim().split(/\s*\n(?:\s*\n)+\s*/)
  // create a structure
  let structure = []
  // keep track of whether a section has been opened
  let section_open = false
  // parse each of the sections
  for (let bit of sections) {
    if (is_style(bit)) {
      // ignore for now
      continue
    } else if (is_section(bit)) {
      // we need to start a new
      if (section_open) {
        structure.push(render_section_end())
      }
      structure.push(render_section_start(base_url + '/' + bit))
      if (!section_open) {
        structure.push(render_back_button())
        section_open = true
      }
    } else {
      if (!section_open) {
        render_section_start()
        structure.push(render_back_button())
        section_open = true
      }

      if (is_title(bit)) {
        structure.push(render_title(bit))
      } else if (is_credit(bit)) {
        structure.push(render_credit(bit))
      } else {
        structure.push(render_part(bit))
      }
    }
  }

  if (section_open) {
    structure.push(render_back_button())
    structure.push('</div>')
  }
  return '<div class="poetry">' + structure.join('') + '</div>'
}

function is_style(bit) {
  return false
}

function is_section(bit) {
  return bit.match(/\.(?:jpg|jpeg|png|gif)/i)
}

function is_title(bit) {
  return bit.startsWith('#')
}

function is_credit(bit) {
  return bit.startsWith('>>')
}

// Other utility functions


// from https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\(c\)/ig, '&copy;');
 }

function save_location(url) {
  history.pushState(null, null, "#" + url.replace(/-/g, "---").replace(/ /g, "-"))
}

function load_location(location) {
  var hash = location.hash

  if (hash == "" || hash == "#") {
    load_menu()
  } else {
    name = hash.substring(1)
    name = name.replace(/---/g, "===").replace(/-/g, " ").replace(/===/g, "-")
    console.log(name)
    load_poem(name)
  }
}

window.onpopstate = function(e) {
  load_location(document.location)
};

document.addEventListener('DOMContentLoaded', function(){
  //load_poem('One Step Closer')
  history.pushState(null, null, document.location.hash)
  load_location(document.location)
}, false);
