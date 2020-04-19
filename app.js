
var SITE_TITLE = 'Poetry Illustrated'
var SITE_DESCRIPTION = 'A collection of poetry and photography'
var SITE_AUTHOR = 'Tamara Azizian'

function build_menu(text) {
  var lines = text.trim().split(/\s*\n\s*/)

  links = []

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.startsWith('*')) {
      // new entry
      line = line.substr(1);
      text = line + '<i class="new">NEW</i>'
    } else {
      text = line;
    }
    links.push('<a class="animated fadeIn" href="' + encodeURI(line) + '">&gt;&gt; ' + text + '</a><br>')
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
        document.title = SITE_TITLE
        set_facebook_title(SITE_TITLE + ' - ' + SITE_DESCRIPTION + ' by ' + SITE_AUTHOR)
        set_facebook_image('menu-background.jpg')
        hook_menu_links()
        goto_menu()
      })
    }
  })
}

function hook_menu_links() {
  var links = document.getElementById('mainmenucontent').getElementsByTagName('a')
  for (var i = 0; i < links.length; i++) {
    var link = links[i]
    link.addEventListener('click', function(e) {
      var name = decodeURI(e.target.getAttribute('href'))
      save_location(name)
      load_poem(name)
      e.preventDefault()
      return false
    }, false);
  }
}

function hook_back_links() {
  var links = document.getElementById('stage').getElementsByClassName('back-button')
  for (var i = 0; i < links.length; i++) {
    var link = links[i]
    link.addEventListener('click', function(e) {
      window.location.hash = ""
      goto_menu(name)
      e.preventDefault()
      return false
    }, false);
  }
}

function load_poem(name) {
  var base_url = 'poetry/' + name
  fetch(base_url + '/poem.txt?t=' + Math.floor(Date.now() / 1000)).then(function(response) {
    if (response.ok == true) {
      response.text().then(function (text) {
        var poem_html = build_poem(text, base_url)
        document.title = SITE_TITLE + " - " + name
        document.getElementById('stage').innerHTML = poem_html
        set_facebook_title(name + ' by ' + SITE_AUTHOR)
        set_facebook_image(base_url + '/images/01.jpg')
        hook_back_links()
        goto_poem()
      })
    }
  })
}

function goto_poem() {
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

function render_dedication(bit) {
  return '<div class="animated fadeIn dedication">' + escapeHtml(bit.replace(/_/g, '')) + '</div>'
}

function render_credit(bit) {
  var lines = bit.trim().split(/\s*\n\s*/)
  var output = []
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].replace(/>>/g, '')
    output.push('<span class="animated fadeIn">' + escapeHtml(line) + '</span>')
  }
  return '<div class="animated fadeIn credits">' + output.join('<br>') + '</div>'
}

function render_part(bit) {
  var lines = bit.trim().split(/\s*\n\s*/)
  var output = []
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i]
    output.push('<span class="animated fadeIn">' + escapeHtml(line) + '</span>')
  }
  return '<div class="stanza">' + output.join('<br>') + '</div>'
}

function render_section_start(bit) {
  var is_video = bit.match(/\.(?:mp4)/i)
  var tag = '<div class="section"'
  if (bit && !is_video) {
    tag += ' style="background-image:url(\'' + encodeURI(bit) + '\')">'
  } else {
    tag += '>'
  }
  if (is_video) {
    tag += '<video autoplay muted loop class="video-bg">\n'
    tag += '<source src="' + bit + '" type="video/mp4">'
    tag += '</video>'
  }
  return tag
}
function render_section_end() {
  return '</div>'
}
function render_back_button() {
  return '<a class="animated fadeIn back-button" href="#">&lt; Back</a><br>'
}

function set_facebook_image(url) {
  document.getElementById('fb-meta-background').setAttribute('content', url)
}

function set_facebook_title(title) {
  document.getElementById('fb-meta-title').setAttribute('content', title)
}

// Function: parse_sections
// changes poem text into a json structure
function build_poem(text, base_url) {
  // firstly split into sections after getting rid of whitespace at start and end
  var sections = text.trim().split(/\s*\n(?:\s*\n)+\s*/)
  // create a structure
  var structure = []
  // keep track of whether a section has been opened
  var section_open = false
  // parse each of the sections
  for (var i = 0; i < sections.length; i++) {
    var bit = sections[i]
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
      } else if (is_dedication(bit)) {
        structure.push(render_dedication(bit))
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
  return bit.match(/\.(?:jpg|jpeg|png|gif|mp4)/i)
}

function is_title(bit) {
  return bit.startsWith('#')
}

function is_dedication(bit) {
  return bit.startsWith('_')
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
    load_poem(name)
  }
}

window.onpopstate = function(e) {
  load_location(document.location)
};

// http://youmightnotneedjquery.com/
function ready(fn) {
  if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn, false);
  }
}

ready(function() {
  //load_poem('One Step Closer')
  history.pushState(null, null, document.location.hash)
  load_location(document.location)
});
