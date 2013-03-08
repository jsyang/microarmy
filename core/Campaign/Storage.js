
define(['core/Resources/campaign'], function(Res) {
  var CampaignStorage;
  return CampaignStorage = (function() {

    function CampaignStorage(_) {
      this._ = $.extend({
        contents: {},
        buried: {},
        owner: {},
        production: {}
      }, _);
    }

    CampaignStorage.prototype.add = function(stuff) {
      var k, v;
      for (k in stuff) {
        v = stuff[k];
        if ((this._.contents[k] != null) && v > 0) {
          this._.contents[k] += v;
        } else {
          this._.contents[k] = v;
        }
      }
    };

    CampaignStorage.prototype.remove = function(stuff) {
      var k, v;
      for (k in stuff) {
        v = stuff[k];
        if (this._.contents[k] && v > 0) {
          this._.contents[k] -= v;
          if (this._.contents[k] <= 0) {
            delete this._.contents[k];
          }
        }
      }
    };

    CampaignStorage.prototype.has = function(stuff) {
      var k, v;
      if (typeof stuff === 'string') {
        return stuff in this._.contents;
      } else {
        for (k in stuff) {
          v = stuff[k];
          if (this._.contents[k] < v) {
            return false;
          }
        }
        return true;
      }
    };

    CampaignStorage.prototype.getContents = function() {
      var contents, k, v, _ref;
      contents = {};
      _ref = this._.contents;
      for (k in _ref) {
        v = _ref[k];
        contents[k] = Math.floor(v);
      }
      return contents;
    };

    CampaignStorage.prototype.printContents = function(stuff) {
      var k, text, v;
      if (stuff == null) {
        stuff = this._.contents;
      }
      text = (function() {
        var _results;
        _results = [];
        for (k in stuff) {
          v = stuff[k];
          _results.push(k + ' x ' + v);
        }
        return _results;
      })();
      if (text.length > 0) {
        return text.join('\n');
      } else {
        return 'nothing';
      }
    };

    CampaignStorage.prototype.isEmpty = function() {
      var k, v;
      return ((function() {
        var _ref, _results;
        _ref = this._.contents;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push(k);
        }
        return _results;
      }).call(this)).length === 0;
    };

    CampaignStorage.prototype.trySynthesizing = function() {
      var k, kn, needs, products, qtyContents, qtyNeeds, qtyProducers, trash, v, vn, _ref;
      products = {};
      _ref = this._.contents;
      for (k in _ref) {
        v = _ref[k];
        if ((Res[k].make != null) && this._.production[k] === true) {
          trash = {};
          needs = Res[k].make.needs;
          if (needs != null) {
            qtyProducers = 0;
            for (kn in needs) {
              vn = needs[kn];
              qtyContents = this._.contents[kn] != null ? this._.contents[kn] : 0;
              qtyNeeds = v * vn;
              if (qtyContents < qtyNeeds) {
                console.log("not enough " + kn + " for " + k + " to fully produce " + k);
                break;
              } else {
                qtyProducers++;
              }
            }
          }
        }
      }
    };

    CampaignStorage.prototype.tryMaintain = function() {
      var k, kn, needs, qtyContents, qtyMaintenance, qtyNeeds, qtyToTrashChance, qtyToTrashTotal, trash, v, vn, _ref;
      _ref = this._.contents;
      for (k in _ref) {
        v = _ref[k];
        if ((Res[k].keep != null)) {
          trash = {};
          needs = Res[k].keep.needs;
          if (needs != null) {
            for (kn in needs) {
              vn = needs[kn];
              qtyContents = this._.contents[kn] != null ? this._.contents[kn] : 0;
              qtyNeeds = v * vn;
              if (qtyContents < qtyNeeds) {
                qtyToTrashTotal = Math.floor(v * (1 - qtyContents / qtyNeeds));
                qtyToTrashChance = Math.round($.r() * qtyToTrashTotal);
                trash[k] = qtyToTrashChance;
                console.log("lost " + qtyToTrashChance + " x " + k + " -- not enough " + kn);
                break;
              } else {
                qtyMaintenance = qtyNeeds;
              }
              trash[kn] = trash[kn] != null ? trash[kn] + qtyMaintenance : qtyMaintenance;
              if (qtyContents >= qtyMaintenance) {
                console.log("" + qtyToTrashChance + " x " + k + " used " + qtyMaintenance + " x " + kn + " for maintenance");
              }
            }
            this.remove(trash);
          }
        }
      }
    };

    return CampaignStorage;

  })();
});

// Generated by CoffeeScript 1.5.0-pre
