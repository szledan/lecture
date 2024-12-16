///   PANEL   //////////////////////////////////////////////////////////////////

class Panel {
    // public defines:
    static DEFAULT_SETTINGS = {
      "readOnly": false,
      "frozen": false,
    
      "width": "100%",
      "height": "300px",
    
      "buttons": [],
    
      "caption": {},
    };
  
    // private:
    html_id = -1;
    settings = null;
  
    // public:
  
    constructor(html_id, settings) {
      this.html_id = html_id;
      this.settings = structuredClone(settings ? settings : Panel.DEFAULT_SETTINGS);
    }
  }
  
///   PANELS   /////////////////////////////////////////////////////////////////

class Panels {
    // private:
    _panels = [];
  
    // public:
  
    constructor() {}
  
    static createPanel(html_id, settings) {
      const panel = new Panel(html_id, settings);
      this._panels.push(panel);
      return panel;
    }
  }
  