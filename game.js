/**
 * The following files are the script files about the data structure
  * In order to ensure the data is cross-platform and the capacity of data is not too large, the data structure is read in binary and by the ReadData object.
 */  /**
 * Created by Yitian Chen on 2019/1/4.
 * Project data · General structure
 */
function DProject(onload){

    var _sf = this;
    //Project name
    this.name = "";
    //Project unique Key
    this.key = "";
    //Project data version code
    this.code = 0;
    //Project block size
    this.blockSize = 48;
    //Project resolution · Width
    this.gameWidth = 960;
    //Project resolution · Height
    this.gameHeight = 540;
    //Project game type 0, ACT 1, ARPG 2, AVG
    this.gameType = 0;
    //Initial map Id
    this.startId = 1;
    //X coordinate of Initial map
    this.startX = 0;
    //Y coordinate of Initial map
    this.startY = 0;
    //The user of project
    this.owner = "";
   //Whether the project is locked
    this.isLock = false;
    //Project map data
    this.maps = [];
    //Project variable
    this.values = [];

    //Read the project data file
    var file = "Game.ifaction";
    var rd = new IRWFile(file);
    //You need to set the read callback to IRWFile, because the file of web is read asynchronously.
    var onloadE = onload;

    //Read project data
    rd.onload = function(){
        var ms = rd.readMS(8);
        if(ms == "IFACTION"){
            _sf.name = rd.readString();
            _sf.key = rd.readString();
            _sf.code = rd.readInt();
            _sf.blockSize = rd.readInt();
            _sf.gameWidth = rd.readInt();
            _sf.gameHeight = rd.readInt();
            _sf.gameType = rd.readInt();
            _sf.startId = rd.readInt();
            _sf.startX = rd.readInt();
            _sf.startY = rd.readInt();

            _sf.owner = rd.readString();
            _sf.isLock = rd.readBool();

            var length = rd.readInt();
            for(var i = 0;i<length;i++){
                var mp = new DMap(rd);
                _sf.maps.push(mp);
            }

            length = rd.readInt();
            for(i = 0;i<length;i++){
                var val = new DValue(rd);
                _sf.values.push(val);
            }

            onloadE();

        }
    };

    /**
     * Initialize the variable library
     * @param data | raw variable data
     * @returns {Array} variable data that can be used in game
     */
    this.initValue = function(data){
        var vals = [];
        for(var i = 0;i< _sf.values.length;i++){
            var value = _sf.values[i].defValue;
            if(_sf.values[i].type == 0){
                value = value == "1";
            }else if(_sf.values[i].type == 1){
                value = parseInt(value);
            }
            if(_sf.values[i].staticValue && data != null && data[_sf.values[i].id] != null){
                vals[_sf.values[i].id] = data[_sf.values[i].id];
            }else{
                vals[_sf.values[i].id] = value;
            }

        }
        return vals;
    };

  /**
     * Find the map corresponding to the ID
     * @param id | MapID
     * @returns {DMap} Map data instance
     */
    this.findMap = function(id){
        for(var i = 0;i<_sf.maps.length;i++){
            if(_sf.maps[i].id == id){
                return _sf.maps[i];
            }
        }
        return null;
    };


}/**
 * Created by Yitian Chen on 2019/1/4.
 * Map Data
 */
function DMap(rd){
     //Map ID
    this.id = 0;
    //Map name
    this.name = "";
    //Map width
    this.width = 20;
    //Map height
    this.height = 12;
   //Map Scene
    this.backgroundId = 1;
    //Map BGM
    this.bgm = new DSetSound();
    //Map BGS
    this.bgs = new DSetSound();
    //Automove or not
    this.autoMove = false;
    //Speed of automove
    this.autoMoveSpeed = 4;

    //Following is the drawing area

    //background layer
    this.backgroud = [];
    //Layer 1 of block
    this.level1 = [];
    //Layer 2 of block
    this.level2 = [];
    //Layer 3 of block
    this.level3 = [];
    //decoration Layer 
    this.decorate = [];
    //enemy Layer
    this.enemys = [];
    //trigger
    this.trigger = [];

    //The parent ID of the map (invalid in game)
    this.fid = -1;
    //Map sorting (invalid in game)
    this.order = 0;
    //gravity coefficient
    this.gravity = 1.0;
    //jump coefficient
    this.resistance = 1.0;


    //Read Data
    this.id = rd.readShort();
    this.name = rd.readString();
    this.width = rd.readShort();
    this.height = rd.readShort();
    this.backgroundId = rd.readShort();
    this.bgm = new DSetSound(rd);
    this.bgs = new DSetSound(rd);
    this.autoMove = rd.readBool();
    this.autoMoveSpeed = rd.readShort();
    this.autoDir = rd.readShort();

    this.fid = rd.readShort();
    this.order = rd.readShort();
    this.gravity = rd.readShort() / 100;
    this.resistance = rd.readShort() / 100;

    var i = 0;
    var j = 0;
    //load background
    for(i = 0;i<this.width;i++){
        this.backgroud[i] = [];
        for(j = 0;j<this.height;j++){
            this.backgroud[i][j] = rd.readShort();
        }
    }

    //load block
    for(i = 0;i<this.width;i++){
        this.level1[i] = [];
        for(j = 0;j<this.height;j++){
            var pow = rd.readShort();
            if(pow == -31822){
                this.level1[i][j] = null;
            }else{
                var at = new DBlock(rd);
                this.level1[i][j] = at;
            }
        }
    }

    for(i = 0;i<this.width;i++){
        this.level2[i] = [];
        for(j = 0;j<this.height;j++){
            pow = rd.readShort();
            if(pow == -31822){
                this.level2[i][j] = null;
            }else{
                at = new DBlock(rd);
                this.level2[i][j] = at;
            }
        }
    }

    for(i = 0;i<this.width;i++){
        this.level3[i] = [];
        for(j = 0;j<this.height;j++){
            pow = rd.readShort();
            if(pow == -31822){
                this.level3[i][j] = null;
            }else{
                at = new DBlock(rd);
                this.level3[i][j] = at;
            }
        }
    }

    for(i = 0;i<this.width;i++){
        this.decorate[i] = [];
        for(j = 0;j<this.height;j++){
            this.decorate[i][j] = rd.readShort();
        }
    }
//Load triggers
    var length = rd.readInt();
    for(i = 0;i<length;i++){
        var tg = new DTrigger(rd);
        this.trigger.push(tg);
    }
//Load enemy
    length = rd.readInt();
    for(i = 0;i<length;i++){
        this.enemys.push(new DMapEnemy(rd));
    }


}/**
 * Created by Yitian Chen on 2019/3/14.
 * Enemy Data of map
 */
function DMapEnemy(rd){
    //Enemy index identification
    this.index = 0;
    //Enemy ID
    this.eid = 0;
    //Enemy direction
    this.dir = 0;
    //X coordinate of enemy
    this.x = 0;
    //Y coordinate of enemy
    this.y = 0;
    //Active or not
    this.isActivity = true;
    //Visible or not
    this.isVisible = true;

    //Read Data
    if(rd != null){
        this.index = rd.readInt();
        this.eid = rd.readShort();
        this.dir = rd.readShort();
        this.x = rd.readShort();
        this.y = rd.readShort();
        this.isActivity = rd.readBool();
        this.isVisible = rd.readBool();
    }


}/**
 * Created by Yitian Chen on 2019/1/4.
 * Trigger data structure
 */
function DTrigger(rd){
    //Trigger ID
    this.id = 0;
    //X-coordinate of trigger
    this.x = 0;
    //Y-coordinate of trigger
    this.y = 0;
    //Trigger name
    this.name = "";
    //Trigger pages
    this.page = [];

    //Read Data
    this.id = rd.readInt();
    this.x = rd.readInt();
    this.y = rd.readInt();
    this.name = rd.readString();

    var length = rd.readInt();
    for(var i = 0;i < length ; i++){
        var e = new DTriggerPage(rd);
        this.page.push(e);
    }

}

/**
 * Data structure of trigger pages
 */
function DTriggerPage(rd){
    //Trigger type
    this.type = 0;
    //Loop execution
    this.loop = true;
     //Parallel execution or not
    this.isParallel = true;
    //Image of trigger page
    this.image = null;
    //conditions of page
    this.logic = null;
    //contents of trigger page
    this.events = [];
    //Gravity
    this.gravity = 0;
    //Penetration
    this.penetration = 0;

    //Read Data
    this.type = rd.readInt();
    this.loop = rd.readBool();
    this.isParallel = rd.readBool();
    this.gravity = rd.readInt();
    this.penetration = rd.readInt();

    this.image = new DTriggerImage(rd);
    this.logic = new DIf(rd);

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        var e = new DEvent(null);
        e.read(rd);
        this.events.push(e);
    }

}

/**
 * Data structure of trigger image
 */
function DTriggerImage(rd){
    //Image ID (ID in DResActor)
    this.id = 0;
    //Direction
    this.dir = 0;
    //fix direction
    this.fixedOrientation = false;
    //opacity0~255
    this.opacity = 255;
    //index of action
    this.actionIndex = 0;
    //Fix action
    this.fixedAction = false;

    this.id = rd.readShort();
    this.dir = rd.readShort();
    this.fixedOrientation = rd.readBool();
    this.opacity = rd.readShort();
    this.actionIndex = rd.readShort();
    this.fixedAction = rd.readBool();
    this.entity = rd.readBool();


}/**
 * Created by Yitian Chen on 2019/1/4.
 * Data structure of trigger content 
 */
function DEvent(parent){
    //trigger code
    this.code = 0;
    //parameter
    this.args = [];
    //Subtrigger Content Group
    this.events = null;
    //Parent trigger group
    this.parent = parent;

    //read data
    this.read = function(rd){
        this.code = rd.readShort();
        var length = rd.readInt();
        for(var i = 0;i<length;i++){
            this.args.push(rd.readString());
        }
        length = rd.readInt();
        if(length >= 0){
            this.events = [];
            for(i = 0;i<length;i++){
                var et = new DEvent(this);
                et.read(rd);
                this.events.push(et);
            }
        }
    };
}/**
 * Created by Yitian Chen on 2019/1/4.
 * Data structure of variable
 */
function DValue(rd){
    //variable ID
    this.id = rd.readInt();
    //variable name
    this.name = rd.readString();
    //variable type
    this.type = rd.readInt();
    //default value of variable
    this.defValue = rd.readString();
    //Whether it is a multicycle variable
    this.staticValue = rd.readBool();
}/**
 * Created by Yitian Chen on 2019/1/4.
 * Condition
 */
function DIf(rd){
    //type  0、AND 1、OR
    this.type = 0;
    //Create Else Branch or not
    this.haveElse = true;
    //condition
    this.items = [];

    this.tag = null;

    //Read data
    if(rd != null){
        this.type = rd.readInt();
        this.haveElse = rd.readBool();
        var length = rd.readInt();

        for(var i = 0;i<length;i++){
            this.items.push(new DIfItem(rd));
        }
    }


    /**
     * DIf Operation result
     * @returns {boolean}
     */
    this.result = function(){
        if(this.items.length <= 0){
            return true;
        }
        if(this.type == 0){//Satisfy All
            var num = 0;
            for(var i = 0;i<this.items.length;i++){
                if(this.items[i].result(this.tag)){
                    num += 1;
                }
            }
            return num >= this.items.length;
        }else if(this.type == 1){//Satisfy Any
            for(i = 0;i<this.items.length;i++){
                if(this.items[i].result(this.tag)){
                    return true;
                }
            }
        }
        return false;

    }
}

/**
 * condition
 */
function DIfItem(rd){
    //type
    this.type = 0;
    //value1
    this.num1Index = 0;
    //function
    this.fuc = 0;
    //type2
    this.type2 = 0;
    //value2
    this.num2 = "";
    //value2 index
    this.num2Index = 0;

    //Read data
    if(rd != null){
        this.type = rd.readInt();
        this.num1Index = rd.readInt();
        this.fuc = rd.readInt();
        this.type2 = rd.readInt();
        this.num2 = rd.readString();
        this.num2Index = rd.readInt();
    }



    /**
     * get Operation result of DIfItem
     * @returns {boolean}
     */
    this.result = function(tag){
        if(this.type == 0){//Variable result
            var val = RV.GameData.value[this.num1Index];
            if(val == null) return false;
            if(this.type2 == 0){//Fixed value
                if(val === true || val === false){
                    return this.operation(val , this.num2 == "1" , this.fuc);
                }else if(!isNaN(val)){
                    return this.operation(val , parseInt(this.num2) , this.fuc);
                }else if(typeof(val)=='string'){
                    return this.operation(val , this.num2 , this.fuc);
                }
            }else{//Variable
                var val2 = RV.GameData.value[this.num2Index];
                if(val2 == null) return false;
                return this.operation(val , val2 , this.fuc);
            }
        }else if(this.type == 1){//enemy result
            var enemy = RV.NowMap.findEnemy(this.num1Index);
            if(enemy == null) return false;
            if(this.fuc == 0){
                return enemy.getDir() == this.num2Index;
            }else if(this.fuc == 1){
                if(this.type2 == 0){
                    return enemy.hp >= enemy.getData().maxHp * (this.num2Index / 100);
                }else if(this.type2 == 1){
                    return enemy.hp <= enemy.getData().maxHp * (this.num2Index / 100);
                }
            }else if(this.fuc == 2){
                return enemy.findBuff(this.num2Index) != null;
            }else if(this.fuc == 3){
                return enemy.isDie;
            }
        }else if(this.type == 2){//about actor
            if(this.fuc == 0){
                return RV.GameData.actor.getActorId() == this.num1Index;
            }else if(this.fuc == 1){
                return RV.GameData.actor.name == this.num2;
            }else if(this.fuc == 2){
                return RV.GameData.actor.skill.indexOf(this.num1Index) >= 0;
            }else if(this.fuc == 3){
                return RV.GameData.actor.equips.arms == this.num1Index;
            }else if(this.fuc == 4){
                return RV.GameData.actor.equips.helmet == this.num1Index ||
                    RV.GameData.actor.equips.armor == this.num1Index ||
                    RV.GameData.actor.equips.shoes == this.num1Index ||
                    RV.GameData.actor.equips.ornaments == this.num1Index;
            }else if(this.fuc == 5){
                return RV.NowMap.getActor().getDir() == this.num1Index;
            }else if(this.fuc == 6){
                if(this.num2Index == 0){
                    return RV.GameData.actor.hp >= RV.GameData.actor.getMaxHP() * (this.num1Index / 100);
                }else if(this.num2Index == 1){
                    return RV.GameData.actor.hp <= RV.GameData.actor.getMaxHP() * (this.num1Index / 100);
                }
            }else if(this.fuc == 7){
                return RV.GameData.actor.findBuff( RV.NowSet.findStateId(this.num1Index).id);
            }else if(this.fuc == 8){
                return RV.IsDie;
            }
        }else if(this.type == 3){//others
            if(this.fuc == 0){
                if(this.num2Index == 0){
                    return RV.GameData.money >= this.num1Index;
                }else if(this.num2Index == 1){
                    return RV.GameData.money < this.num1Index;
                }
            }else if(this.fuc == 1){
                return RV.GameData.findItem(0,this.num1Index) != null ;
            }else if(this.fuc == 2){
                return RV.GameData.findItem(1,this.num1Index) != null || RV.GameData.actor.equips.arms == this.num1Index;
            }else if(this.fuc == 3){
                return RV.GameData.findItem(2,this.num1Index) != null || RV.GameData.actor.equips.helmet == this.num1Index || RV.GameData.actor.equips.armor == this.num1Index || RV.GameData.actor.equips.shoes == this.num1Index || RV.GameData.actor.equips.ornaments == this.num1Index;
            }else if(this.fuc == 4){
                if(this.num2Index == 0){
                    return IInput.isKeyDown(this.num1Index);
                }else{
                    return IInput.isKeyPress(this.num1Index);
                }
            }else if(this.fuc == 5){
                var rect = this.num2.split(",");
                if(this.num2Index == 0){
                    return IInput.up && IInput.x >= parseInt(rect[0]) && IInput.y >= parseInt(rect[1]) &&
                        IInput.x <= parseInt(rect[0]) + parseInt(rect[2]) &&
                        IInput.y <= parseInt(rect[1]) + parseInt(rect[3]);
                }else if(this.num2Index == 1){
                    return IInput.down && IInput.x >= parseInt(rect[0]) && IInput.y >= parseInt(rect[1]) &&
                        IInput.x <= parseInt(rect[0]) + parseInt(rect[2]) &&
                        IInput.y <= parseInt(rect[1]) + parseInt(rect[3]);
                }
            }else if(this.fuc == 6){
                if(this.num1Index == 2){
                    return IVal.Platform == "Android";
                }else if(this.num1Index == 3){
                    return IVal.Platform == "iOS";
                }else if(this.num1Index == 4){
                    return IVal.Platform == "WeiXin";
                }else if(this.num1Index == 0){
                    return IVal.Platform == "Windows";
                }else if(this.num1Index == 1){
                    return IVal.Platform == "Web";
                }
            }else if(this.fuc == 7){
                var obj = null;
                try{
                    obj = eval(this.num2);
                    if(typeof obj == "boolean"){
                        return obj;
                    }else{
                        return obj != null;
                    }
                }catch(e){
                    return false;
                }
            }else if(this.fuc == 8){
                if(tag == null) return false;
                return tag.getSwitch(this.num1Index);
            }
        }
        return false;
    };

    /**
     * Numerical operation method
     * @param value1 
     * @param value2 
     * @param func | Comparison method
     * @returns {boolean} | Whether it meets the expectation
     */
    this.operation = function(value1 , value2 , func){
        if(func == 0){
            return value1 == value2;
        }else if(func == 1){
            return value1 != value2;
        }else if(func == 2){
            return value1 > value2;
        }else if(func == 3){
            return value1 < value2;
        }else if(func == 4){
            return value1 >= value2;
        }else if(func == 5){
            return value1 <= value2;
        }
        return false;
    }
}/**
 * Created by Yitian Chen on 2019/1/4.
 * Data structure of drawing block on map
 */
function DBlock(rd){
    //block type
    this.type = 0;
    //block ID
    this.id = 0;
    //drawing index
    this.drawIndex = 0;

    //block width
    this.width = 1;
    //block height
    this.height = 1;

    //Inner block
    this.inBlock = null;
    //trigger
    this.trigger = null;

    //read data
    this.type = rd.readShort();
    this.id = rd.readShort();

    this.width = rd.readShort();
    this.height = rd.readShort();

    this.drawIndex = rd.readShort();

    var isa = rd.readBool();
    if(isa){
        this.inBlock = new DBlock(rd);
    }
    isa = rd.readBool();
    if(isa){
        this.trigger = new DTrigger(rd);
        this.trigger.father = this;
    }
    this.isAuto = rd.readBool();

}/**
 * Created by Yitian Chen on 2019/1/7.
 */
function DRes(onload){

    var _sf = this;

    //version code for resource
    this.code = 0;
    //scene resource
    this.resScene = [];
    //block resource
    this.resBBlock = [];
    //actor resource
    this.resActor = [];
    //decoration resource
    this.resDecorate = [];
    //animation resource
    this.resAnim = [];

    var onloadE = onload;
    //Read data
    var rd = new IRWFile("Resource.ifres");
    rd.onload = function(){
        _sf.code = rd.readShort();

        var length = rd.readInt();
        for(var i = 0;i<length;i++){
            rd.readShort();
            rd.readString();
            rd.readString();
            rd.readShort();
            rd.readString();
            rd.readShort();
            rd.readShort();
            rd.readShort();
            rd.readShort();
            rd.readShort();
        }

        length = rd.readInt();
        for(i = 0;i < length; i++){
            var temp = new DResBaseBlock(rd);
            _sf.resBBlock[temp.id] = temp;
        }

        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DResActor(rd);
            _sf.resActor[temp.id] = temp;
        }

        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DResDecorate(rd);
            _sf.resDecorate[temp.id] = temp;
        }

        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DResScene(rd);
            _sf.resScene[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            var type = rd.readShort();
            if(type == -3310){
                temp = new DResAnimFrame(rd);
                _sf.resAnim[temp.id] = temp;
            }else if(type == -2801){
                temp = new DResAnimParticle(rd);
                _sf.resAnim[temp.id] = temp;
            }
        }


        onloadE();

    };
    /**
     * Find scene resource
     * @param id
     * @returns {DResScene}
     */
    this.findResMap = function(id){
        return _sf.resScene[id];
    };
    /**
     * Find block resource
     * @param id
     * @returns {DResBaseBlock}
     */
    this.findResBlock = function(id){
        return _sf.resBBlock[id];
    };
    /**
     * Find Actor resource
     * @param id
     * @returns {DResActor}
     */
    this.findResActor = function(id){
        return _sf.resActor[id];
    };
    /**
     * Find decoration resource
     * @param id
     * @returns {DResDecorate}
     */
    this.findResDecorate = function(id){
        return _sf.resDecorate[id];
    };

    /**
     * Find animation configuration data
     * @param id
     * @returns DResAnimFrame
     */
    this.findResAnim = function(id){
        return _sf.resAnim[id];
    }

}/**
 * Created by Yitian Chen on 2019/1/7.
 * Data structure of scene
 */
function DResScene(rd){
    //Blocks
    this.blocks = [];
    //Tilesets
    this.decorates = [];

    //Read data
    this.id = rd.readShort();
    this.name = rd.readString();
    this.background1 = new SecenBack(rd);
    this.background2 = new SecenBack(rd);

    var length = rd.readInt();
    for(var i = 0;i<length ;i++){
        var sb = new SceneBlock(rd);
        this.blocks.push(sb);
    }

    length = rd.readInt();
    for(i = 0;i<length;i++){
        this.decorates.push(rd.readShort());
    }

    this.getDec = function(index){
        if(index < this.decorates.length){
            return RV.NowRes.findResDecorate(this.decorates[index]);
        }
        return null;
    }

}
/**
 * Data structure of background
 */
function SecenBack(rd){
    //file
    this.file = rd.readString();
    //draw type
    this.type = rd.readShort();
}
/**
 * Data structure of blocks
 */
function SceneBlock(rd){
    //image resource ID
    this.id = rd.readShort();
    //block type （GroundBlock、SlideBlock、SwampBlock、DeathBlock）
    this.type = rd.readShort();
}/**
 * Created by Yitian Chen on 2019/1/7.
 * Data structure of block resource
 */
function DResBaseBlock(rd){
    //block ID
    this.id = rd.readShort();
    //draw type
    this.drawType = rd.readShort();
    //file path
    this.file = rd.readString();
    //name
    this.name = rd.readString();
    //note
    this.msg = rd.readString();
    //layer（z）
    this.z = rd.readShort();

    //Death after Submersion
    this.mDie = rd.readBool();
    //Drag Coefficient
    this.mNum = rd.readShort();

    var length = rd.readInt();
    //animation list
    this.anim = [];
    for(var i = 0;i<length;i++){
        this.anim.push(new DAnimRect(rd));
    }
}/**
 * Created by Yitian Chen on 2019/1/7.
 * Data structure of character resource
 */
function DResActor(rd){

    var _sf = this;
    //file index
    this.actionName = [];
    //action List
    this.actionList = [];

    //ID of character resource
    this.id = 0;
    //name of character resource
    this.name = "";
    //note of character resource
    this.msg = "";
    //file of character resource
    this.file = "";
    //animation
    this.standA = [];
    this.jumpA = [];
    this.fallA = [];
    this.walkA = [];
    this.runA = [];
    this.squatA = [];
    this.attackA = [];
    this.attackJumpA = [];
    this.attackSquatA = [];
    this.injuredA = [];
    this.deathA = [];
    this.attackRunA = [];

    this.otherAnim =[];

    //Read data
    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();
    this.file = rd.readString();

    readAnim(this.standA,rd);
    readAnim(this.jumpA,rd);
    readAnim(this.fallA, rd);
    readAnim(this.walkA, rd);
    readAnim(this.runA, rd);
    readAnim(this.squatA, rd);
    readAnim(this.attackA, rd);
    readAnim(this.attackJumpA, rd);
    readAnim(this.attackSquatA, rd);
    readAnim(this.injuredA,rd);
    readAnim(this.deathA,rd);
    readAnim(this.attackRunA,rd);

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        rd.readString();//skip name
        var tempList = [];
        readAnim(tempList,rd);
        this.otherAnim.push(tempList);
    }

    function readAnim(list,rd){
        var length = rd.readInt();
        for(var i = 0;i<length;i++){
            list.push(new DAnimRect(rd));
        }
    }

    //file index
    this.actionName = ["_stand.png","_jump.png","_fall.png",
        "_walk.png","_run.png","_squat.png",
        "_attack.png","_attack-jump.png","_attack-squat.png",
        "_injured.png","_death.png","_attack-run.png"];

    for(i = 0;i<this.otherAnim.length;i++){
        this.actionName.push("_other" + (i + 1) + ".png");
    }


    //action index
    this.actionList = [this.standA,this.jumpA,this.fallA,
        this.walkA,this.runA,this.squatA,
        this.attackA,this.attackJumpA,this.attackSquatA,
        this.injuredA,this.deathA,this.attackRunA];

    for(i = 0;i<this.otherAnim.length;i++){
        this.actionList.push(this.otherAnim[i]);
    }

    /**
     * Cache character resource
     */
    this.loadCache = function(){
        for(var i = 0;i < _sf.actionList.length;i++){
            if(_sf.actionList[i].length > 0){
                RF.LoadCache("Characters/" + _sf.file + _sf.actionName[i]);
            }
        }
    }


}/**
 * Created by Yitian Chen on 2019/1/7.
 * Data structure of Decoration resource
 */
function DResDecorate(rd){
    //Decoration ID
    this.id = rd.readShort();
    //Decoration name
    this.name = rd.readString();
    //file
    this.file = rd.readString();
    //action type
    this.type = rd.readShort();
    //action time
    this.time = rd.readInt();
    //Background decoration or not
    this.isBack = rd.readBool();
    //animation list
    this.anim = [];
    var length = rd.readInt();
    for(var i = 0;i<length ;i++){
        this.anim.push(new DAnimRect(rd));
    }
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Key frame animation
 */
function DResAnimFrame(rd){
    //animation
    this.anims = [];
    //action list
    this.actionList = [];

    //ID
    this.id = rd.readShort();
    //name
    this.name = rd.readString();
    //note
    this.msg = rd.readString();
    //animation location
    this.point = new DResAnimPoint(rd);
    //animation file
    this.file = rd.readString();

    //load animation and action list
    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        this.anims.push(new DAnimRect(rd));
    }

    length = rd.readInt();
    for(i = 0;i<length;i++){
        this.actionList.push(new DResAnimFrameAction(rd));
    }

}/**
 * Created by Yitian Chen on 2019/3/14.
 * Data structure of Key frame animation action
 */
function DResAnimFrameAction(rd){
    //color of flash
    this.color = [0,0,0,0];
    //flash color on actor
    this.actorColor = [0,0,0,0];

    //frame
    this.index = rd.readShort();
    //Whether there is a decision area
    this.isAtk = rd.readBool();
    //DecisionX
    this.AtkX = rd.readShort();
    //DecisionY
    this.AtkY = rd.readShort();
    //Decision width
    this.AtkWidth = rd.readShort();
    //Decision height
    this.AtkHeight = rd.readShort();
    //flash or not
    this.isFlash = rd.readBool();
    this.color[0] = rd.readShort();
    this.color[1] = rd.readShort();
    this.color[2] = rd.readShort();
    this.color[3] = rd.readShort();

    //duration of flash
    this.flashTime = rd.readShort();
    //transparent or not
    this.isOpactiy = rd.readBool();
    //Opacity
    this.opacity = rd.readShort();
    //duration of changing opacity
    this.opacityTime = rd.readShort();

    //Zoom or not
    this.isZoom = rd.readBool();
    //zoom x
    this.zoomX = rd.readShort();
    //zoom y
    this.zoomY = rd.readShort();
    //duration of zoom
    this.zoomTime = rd.readShort();
    //actor flash or not
    this.isActorFlash = rd.readBool();
    this.actorColor[0] = rd.readShort();
    this.actorColor[1] = rd.readShort();
    this.actorColor[2] = rd.readShort();
    this.actorColor[3] = rd.readShort();
    //duration of actor flash
    this.actorFlashTime = rd.readShort();


}/**
 * Created by Yitian Chen on 2019/3/14.
 * Data structure of particle
 */
function DResAnimParticle(rd){
    //Files of particle
    this.files = [];
    //ID
    this.id = rd.readShort();
    //name
    this.name = rd.readString();
    //note
    this.msg = rd.readString();
    //Location
    this.point = new DResAnimPoint(rd);

    //Type
    this.launchType = rd.readShort();
    //Radius
    this.radius = rd.readShort();
    //Affected by gravity or not
    this.isGravity = rd.readBool();
    //Width
    this.width = rd.readShort();
    //Height
    this.height = rd.readShort();
    //Distance
    this.distance = rd.readShort();
    //direction
    this.dir = rd.readShort();
    //duration
    this.time = rd.readShort();
    //number of particle
    this.number = rd.readShort();
    //Storage structure file
    this.file = rd.readString();

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        this.files.push(rd.readString());
    }
    //SE
    this.sound = new DSetSound(rd);
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Data structure of animation display position 
 */
function DResAnimPoint(rd){
    //Relative position or absolute position
    this.type = rd.readShort();
    //X-coordinate
    this.x = rd.readShort();
    //Y-coordinate
    this.y = rd.readShort();
    //relative direction
    this.dir = rd.readShort();

}/**
 * Created by Yitian Chen on 2019/1/7.
 * Data structure of single animation frame
 */
function DAnimRect(rd){
    var _sf = this;
    //Offset X in the image
    this.x = 0;
    //Offset Y in the image
    this.y = 0;
    //width
    this.width = 0;
    //height
    this.height = 0;
    //Offset X
    this.dx = 0;
    //Offset Y
    this.dy = 0;
    //Wait time
    this.time = 0;
    //Attack Frame or not
    this.effective = false;
    //SE
    this.sound = "";
    //Volume of SE
    this.volume = 80;
    //Emission point
    this.points = [];
    //Read data
    this.x = rd.readInt();
    this.y = rd.readInt();
    this.width = rd.readInt();
    this.height = rd.readInt();
    this.dx = rd.readInt();
    this.dy = rd.readInt();
    this.time = rd.readInt();

    this.effective = rd.readBool();

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        this.points.push(new APoint(rd));
    }

    this.sound = rd.readString();
    this.volume = rd.readShort();

    this.getRect = function(){
        return new IRect(_sf.x,_sf.y , _sf.x + _sf.width, _sf.y + _sf.height);
    };

    this.collisionRect = new ARect(rd);

}
/**
 * Emission point
 */
function APoint(rd){
    this.x = 0;
    this.y = 0;

    this.x = rd.readInt();
    this.y = rd.readInt();
}
/**
 * Collision Area 
 */
function ARect(rd){
    //Auto correct
    this.auto = rd.readBool();
    this.x = rd.readInt();
    this.y = rd.readInt();
    this.width = rd.readInt();
    this.height = rd.readInt();
}
/**
 * Created by Yitian Chen on 2019/1/8.
 * Data structure of settings
 */
function DSet(onload){
    var onloadE = onload;

    //Version code
    this.code = 0;
    //System
    this.setAll = null;
    //Actor settings
    this.setActor = [];
    //Interactive Block settings
    this.setBlock = [];
    //items settings
    this.setItem = [];
    //weapon settings
    this.setArms = [];
    //armors settings
    this.setArmor = [];
    //enemy settings
    this.setEnemy = [];
    //state settings
    this.setState = [];
    //element settings
    this.setAttribute = [];
    //skills settings
    this.setSkill = [];
    //bullet settings
    this.setBullet = [];
    //common trigger settings
    this.setEvent = [];

    var _sf = this;

    //Read data
    var rd = new IRWFile("Setting.ifset");
    rd.onload = function(){

        _sf.code = rd.readShort();
        _sf.setAll = new DSetAll(rd);
        var length = rd.readInt();
        for(var i = 0;i<length;i++){
            var temp = new DSetActor(rd);
            _sf.setActor[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetInteractionBlock(rd);
            _sf.setBlock[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetItem(rd);
            _sf.setItem[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetArms(rd);
            _sf.setArms[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetArmor(rd);
            _sf.setArmor[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetEnemy(rd);
            _sf.setEnemy[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetState(rd);
            _sf.setState[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetAttribute(rd);
            _sf.setAttribute[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetSkill(rd);
            _sf.setSkill[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetBullet(rd);
            _sf.setBullet[temp.id] = temp;
        }
        length = rd.readInt();
        for(i = 0;i<length;i++){
            temp = new DSetEvent(rd);
            _sf.setEvent[temp.id] = temp;
        }
        onloadE();
    };

    /**
     * find element
     * @param id
     * @returns {DSetAttribute}
     */
    this.findAttributeId = function(id){
        return _sf.setAttribute[id];
    };
    /**
     * find common trigger
     * @param id
     * @returns {DSetEvent}
     */
    this.findEventId = function(id){
        return _sf.setEvent[id];
    };

    /**
     * find item
     * @param id
     * @returns {DSetItem}
     */
    this.findItemId = function(id){
        return _sf.setItem[id];
    };

    /**
     * find enemy by id
     * @param id | id of enemy
     * @returns {DSetEnemy}
     */
    this.findEnemyId = function(id){
        return _sf.setEnemy[id];
    };
    /**
     * find weapon
     * @param id
     * @returns {DSetArms}
     */
    this.findArmsId = function(id){
        return _sf.setArms[id];
    };
    /**
     * find armor
     * @param id
     * @returns {DSetArmor}
     */
    this.findArmorId = function(id){
        return _sf.setArmor[id];
    };
    /**
     * find skill
     * @param id | id of enemy
     * @returns {DSetSkill}
     */
    this.findSkillId = function(id){
        return _sf.setSkill[id];
    };
    /**
     * find actor
     * @param id
     * @returns {DSetActor}
     */
    this.findActorId = function(id){
        return _sf.setActor[id];
    };
    /**
     * find bullet
     * @param id
     * @returns {DSetBullet}
     */
    this.findBullet = function(id){
        return _sf.setBullet[id];
    };
    /**
     * find Interactive Block
     * @param id
     * @returns {DSetInteractionBlock}
     */
    this.findBlockId = function(id) {
        return _sf.setBlock[id];
    };
    /**
     * find BUFF(state)
     * @param id
     * @returns {DSetState}
     */
    this.findStateId = function(id){
        return _sf.setState[id];
    }

}/**
 * Created by Yitian Chen on 2019/1/8.
 * Settings·data structure of System
 */
function DSetAll(rd){

    //Operation of key
    this.key = new Array(30);
    //Initial Actor
    this.startActorID = rd.readShort();
    //Death Animation
    this.actorDieAnimID = rd.readShort();
    //Level Up Animation
    this.actorLevelupAnimId = rd.readShort();
    //Initial Life
    this.life = rd.readShort();
    //Operation type
    this.ctrlUpDown = rd.readShort();
    //Auto-move
    this.autoMove = rd.readBool();
    //Title image
    this.titleFile = rd.readString();
    //Title Music
    this.titleMusic = new DSetSound(rd);
    //Skip title
    this.skipTitle = rd.readBool();

    //Jump Height
    this.jumpSpeed = rd.readShort();
    //Jump Frequency
    this.jumpTimes = rd.readShort();
    //Jump SE
    this.jumpSound = new DSetSound(rd);

    //DeathBlock
    this.blockDieToDie = rd.readBool();
    this.blockDieType = rd.readShort();
    this.blockDieNum1 = rd.readShort();
    this.blockDieNum2 = rd.readShort();

    //Gravity ON
    this.haveGravity = rd.readBool();
    //Gravity Coefficient
    this.gravityNum = rd.readShort();


    //SE
    this.enterSound = new DSetSound(rd);
    this.cancelSound = new DSetSound(rd);
    this.selectSound = new DSetSound(rd);
    this.equipSound = new DSetSound(rd);
    this.injuredSound = new DSetSound(rd);

    for(var i = 0; i < 30;i++){
        this.key[i] = rd.readShort();
    }

    //Show UI
    this.uiHp = rd.readBool();
    this.uiLife = rd.readBool();
    this.uiMp = rd.readBool();
    this.uiExp = rd.readBool();
    this.uiMenu = rd.readBool();
    this.uiItems = rd.readBool();
    this.uiSkill = rd.readBool();
    this.uiPhone = rd.readBool();
    this.uiMoney = rd.readBool();

}/**
 * Created by Yitian Chen on 2019/1/8.
 * Settings·data structure of actor
 */
function DSetActor(rd){
    //skills
    this.skills = [];

    //actor ID
    this.id = rd.readShort();
    //actor name
    this.name = rd.readString();
    //attack type
    this.attackType = rd.readShort();
    //min level
    this.minLevel = rd.readShort();
    //max level
    this.maxLevel = rd.readShort();

    //resource ID of actor
    this.actorId = rd.readShort();
    //default bullet ID
    this.bulletAnimId = rd.readShort();

    //parameter
    this.MaxHP = new Array(99);
    this.MaxMP = new Array(99);

    this.WAttack = new Array(99);
    this.WDefense = new Array(99);

    this.MAttack = new Array(99);
    this.MDefens = new Array(99);

    this.Speed = new Array(99);
    this.Luck = new Array(99);

    this.exp = new Array(99);

    //read configuration data
    for (var i = 0; i < 99; i++) {
        this.MaxHP[i] = rd.readInt();
    }

    for (i = 0; i < 99; i++) {
        this.MaxMP[i] = rd.readInt();
    }

    for ( i = 0; i < 99; i++) {
        this.WAttack[i] = rd.readInt();
    }

    for ( i = 0; i < 99; i++) {
        this.WDefense[i] = rd.readInt();
    }

    for ( i = 0; i < 99; i++) {
        this.MAttack[i] = rd.readInt();
    }

    for ( i = 0; i < 99; i++) {
        this.MDefens[i] = rd.readInt();
    }

    for ( i = 0; i < 99; i++) {
        this.Speed[i] = rd.readInt();
    }

    for ( i = 0; i < 99; i++) {
        this.Luck[i] = rd.readInt();
    }

    for ( i = 0; i < 99; i++) {
        this.exp[i] = rd.readInt();
    }

    this.armsId = rd.readShort();
    this.shoesId = rd.readShort();
    this.armorId = rd.readShort();
    this.helmetId = rd.readShort();
    this.ornamentsId = rd.readShort();

    var length = rd.readInt();
    for ( i = 0; i < length; i++) {
        this.skills.push(new DSetActorSkill(rd));
    }

    /**
     * Get the parameter of the corresponding level
     * @param lv
     * @returns {{maxHp: ...*, luck: ...*, watk: ...*, maxExp: ...*, matk: ...*, wdef: ...*, maxMp: ...*, mdef: ...*, speed: ...*}}
     */
    this.getPowForLevel = function(lv){
        var level = lv - 1;
        if(level > 98){
            level = 98;
        }else if(level < 0){
            level = 0;
        }
        var obj ={
            maxHp : this.MaxHP[level],
            maxMp : this.MaxMP[level],
            watk  : this.WAttack[level],
            wdef  : this.WDefense[level],
            matk  : this.MAttack[level],
            mdef  : this.MDefens[level],
            speed : this.Speed[level],
            luck  : this.Luck[level],
            maxExp  : this.exp[level]
        };
        if(level >= 98){
            obj.maxExp = -1;
        }else{
            obj.maxExp = this.exp[level + 1];
        }
        return obj;
    }
}
/**
 * data structure of learning skills
 */
function DSetActorSkill(rd){
    this.level = rd.readShort();
    this.skillId = rd.readShort();
}/**
 * Created by Yitian Chen on 2019/1/8.
 * Settings·data structure of Interactive Block
 */
function DSetInteractionBlock(rd){
    //Is Item Block or not
    this.isItem = false;
    //Inner block can be set
    this.isImplant = false;
    //Gravity
    this.isGravity = true;
    //Through
    this.isPenetrate = false;
    //can change image
    this.isStatus = false;
    //DeathBlock
    this.isDie = false;
    //Can Be Destroied
    this.isDestroy = false;
    //Jump
    this.isJump = false;
    //Disappear
    this.isVanish = false;


    //Gold increase
    this.money = 0;
    //Hp increase
    this.hpValue = 0;
    //Mp increase
    this.mpValue = 0;
    //Max Hp increase
    this.maxHpValue = 0;
    //Max Mp increase
    this.maxMpValue = 0;
    //life increase
    this.leftValue = 0;

    //Read data

    this.id = rd.readShort();
    this.name = rd.readString();
    this.BlockId = rd.readShort();
    this.BlockId2 = rd.readShort();
    this.EventId = rd.readShort();

    this.animId = rd.readShort();
    this.actorAnimId = rd.readShort();

    this.isItem = rd.readBool();

    this.isGravity = rd.readBool();
    this.isPenetrate = rd.readBool();
    this.isStatus = rd.readBool();

    if (this.isItem) {
        this.money = rd.readInt();
        this.hpValue = rd.readInt();
        this.mpValue = rd.readInt();
        this.maxHpValue = rd.readInt();
        this.maxMpValue = rd.readInt();
        this.leftValue = rd.readInt();
    }else {
        this.isDie = rd.readBool();
        this.isDestroy = rd.readBool();
        this.isJump = rd.readBool();
        this.isVanish = rd.readBool();

        this.isImplant = rd.readBool();
    }

    this.cState = [];

    var length = rd.readInt();
    for (var i = 0; i < length; i++) {
        this.cState[rd.readShort()] = rd.readShort();
    }
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Settings·Data structure of items
 */
function DSetItem(rd){
    //ID
    this.id = rd.readShort();
    //name
    this.name = rd.readString();
    //note
    this.msg = rd.readString();
    //Icon
    this.icon = rd.readString();
    //Main Element
    this.mainAttribute = rd.readShort();
    //Secondary Element
    this.otherAttribute = rd.readShort();

    //type
    this.userType = rd.readShort();
    //animation
    this.userAnim = rd.readShort();
    //action
    this.userAction = rd.readShort();
    //bullet
    this.bullet = rd.readShort();
    //Scope
    this.triggerX = rd.readShort();
    this.triggerY = rd.readShort();
    this.triggerAnim = rd.readShort();
    this.triggerWidth = rd.readShort();
    this.triggerHeight = rd.readShort();

    //price
    this.price = rd.readInt();
    //CD
    this.cd = rd.readInt();
    //ID of Common Trigger
    this.eventId = rd.readShort();
    //SE
    this.se = new DSetSound(rd);

    //Non-consumable
    this.noExpend = rd.readBool();
    //Auto-use after Death
    this.afterDeath = rd.readBool();
    //type of parameter change
    this.upType = rd.readShort();
    //Variation
    this.upValue = rd.readShort();
    //heal HP and MP
    this.HpNum1 = rd.readShort();
    this.HpNum2 = rd.readInt();
    this.MpNum1 = rd.readShort();
    this.MpNum2 = rd.readInt();
    this.dispersed = rd.readShort();
    //change state
    this.cState = [];
    var length = rd.readInt();
    for (var i = 0; i < length; i++) {
        this.cState[rd.readShort()] = rd.readShort();
    }
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Settings·Data structure of weapons
 */
function DSetArms(rd){
    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();

    this.icon = rd.readString();
    this.mainAttribute = rd.readShort();
    this.otherAttribute = rd.readShort();

    //type of arm
    this.type = rd.readShort();
    //bullet of arm
    this.bulletId = rd.readShort();
    //attack interval of arm
    this.atkInterval = rd.readShort();
    //arm Range
    this.atkDistance = rd.readShort() / 100;
    //Hit Animation
    this.atkAnimId = rd.readShort();

    //price
    this.price = rd.readShort();
    //Knockback
    this.repel = rd.readShort();

    //parameter
    this.maxHP = rd.readInt();
    this.maxMP = rd.readInt();
    this.watk = rd.readInt();
    this.wdef = rd.readInt();
    this.matk = rd.readInt();
    this.mdef = rd.readInt();
    this.speed = rd.readInt();
    this.luck = rd.readInt();

    //Drain HP
    this.bloodSucking = rd.readShort();

    //Change States
    this.cState = [];
    var length = rd.readInt();
    for (var i = 0; i < length; i++) {
        this.cState[rd.readShort()] = rd.readShort();
    }
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Settings·Data structure of armors
 */
function DSetArmor(rd){
    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();

    this.icon = rd.readString();
    this.mainAttribute = rd.readShort();
    this.otherAttribute = rd.readShort();

    //type of armor
    this.type = rd.readShort();
    this.stateId = rd.readShort();
    this.stateTime = rd.readShort();

    //price
    this.price = rd.readShort();
    //Knockback Defense
    this.repel = rd.readShort();


    //parameter
    this.maxHP = rd.readInt();
    this.maxMP = rd.readInt();
    this.watk = rd.readInt();
    this.wdef = rd.readInt();
    this.matk = rd.readInt();
    this.mdef = rd.readInt();
    this.speed = rd.readInt();
    this.luck = rd.readInt();


    //deductible parameter
    this.useMp = rd.readBool();
    this.useMpValue = rd.readShort();
    this.useMoney = rd.readBool();
    this.useMoneyValue = rd.readShort();
    this.revive = rd.readBool();
    this.reviveHp = rd.readShort();
    this.reviveTime = rd.readShort();


    //States Resist
    this.cState = [];
    var length = rd.readInt();
    for (var i = 0; i < length; i++) {
        this.cState[rd.readShort()] = rd.readShort();
    }
}/**
 * Created by Yitian Chen on 2019/1/8.
 * Settings·Data structure of enemies
 */
function DSetEnemy(rd){
    //defence state
    this.defState = [];
    //action list
    this.action = [];
    //Drop Items
    this.items = [];
    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();

    //ID of enemy image
    this.picId = rd.readShort();
    //Reward EXP
    this.exp = rd.readInt();
    //Reward gold
    this.money = rd.readInt();
    //Execute after Death
    this.evetId = rd.readShort();

    //attack type
    this.atkType = rd.readShort();
    //move type
    this.moveType = rd.readShort();

    //Main element ID
    this.attributeId = rd.readShort();
    //Secondary Element ID
    this.otherAttributeId = rd.readShort();
    //Death Animation
    this.dieAnimId = rd.readShort();
    //Touch to Damage or not
    this.isContactInjury = rd.readBool();
    //Knockback
    this.atkRepel = rd.readShort();
    //Hit Animation
    this.atkAnim = rd.readShort();
    //Attack Range
    this.atkDistance = rd.readShort() / 100;
    //Bullet
    this.atkBullet = rd.readShort();
    //Attack frequency
    this.atkTime = rd.readShort();


    //Move speed
    this.moveSpeed = rd.readShort();

    //move settings
    this.moveTarget = rd.readShort();
    this.isUpstairs = rd.readBool();
    this.isPenetrate = rd.readBool();
    this.isJump = rd.readBool();
    this.isSwerve = rd.readBool();

    this.isTeleporting = rd.readBool();
    this.isEntity = rd.readBool();

    //parameter
    this.maxHp = rd.readInt();
    this.maxMp = rd.readInt();
    this.WAtk = rd.readInt();
    this.WDef = rd.readInt();
    this.MAtk = rd.readInt();
    this.MDef = rd.readInt();
    this.Speed = rd.readInt();
    this.Luck = rd.readInt();



    var length = rd.readInt();
    for ( i = 0; i < length; i++) {
        this.items.push(new EnemyItem(rd));
    }

    length = rd.readInt();
    for ( i = 0; i < length; i++) {
        this.action.push(new EnemyAction(rd));
    }

    length = rd.readInt();
    for (var i = 0; i < length; i++) {
        this.defState[rd.readShort()] = rd.readShort();
    }

}
/**
 * Settings·data structure of drops
 */
function EnemyItem(rd){
    this.id = rd.readShort();
    //type
    this.type = rd.readShort();
    //rate
    this.rate = rd.readShort();
}
/**
 * Settings·data structure of actions
 */
function EnemyAction(rd){
    //Type
    this.IfType = rd.readShort();
    //Number1
    this.IfNum1 = rd.readShort();
    //Number2
    this.IfNum2 = rd.readShort();
    //Number3
    this.IfNum3 = rd.readInt();

    //Rate
    this.rate = rd.readShort();

    //Action type
    this.actionType = rd.readShort();
    //Action id
    this.actionId = rd.readShort();
    //Skill of action
    this.skillId = rd.readShort();

    //Interval
    this.nextTime = rd.readShort();

    //Within Range
    this.triggerX = rd.readShort();
    this.triggerY = rd.readShort();
    this.triggerWidth = rd.readShort();
    this.triggerHeight = rd.readShort();
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Settings·Data structure of buff(state)
 */
function DSetState(rd){
    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();

    //BUFF Icon
    this.pic = rd.readString();
    //BUFF animation
    this.animID = rd.readShort();
    this.mainAttribute = rd.readShort();
    this.otherAttribute = rd.readShort();
    //BUFF limit
    this.limit = new DSetStateLimit(rd);

    //Unblockable
    this.cantResist = rd.readBool() ;
    //Invincible
    this.invincible = rd.readBool();
    //Super Armor
    this.superArmor = rd.readBool();

    //recover parameter
    this.cHpBool = rd.readBool();
    this.cHP = rd.readShort();
    this.cMpBool = rd.readBool();
    this.cMP = rd.readShort();
    this.cSpeedBool = rd.readBool();
    this.cSpeed = rd.readShort();
    this.cTimes = rd.readShort();

    //Remove at Battle End
    this.RelieveOutOfCombat = rd.readBool();
    //Remove by Time
    this.RelieveTime = rd.readBool();
    //Time
    this.RTime = rd.readShort();
    //Remove by Damage
    this.RelieveHP = rd.readBool();
    //cost HP
    this.RHP = rd.readShort();
    //Remove by Walking
    this.RelieveMove = rd.readBool();
    //steps
    this.RMove = rd.readShort();

    //change state
    this.cState = [];
    var length = rd.readInt();
    for (var i = 0; i < length; i++) {
        this.cState[rd.readShort()] = rd.readShort();
    }

    //change parameter
    this.maxHP = rd.readInt();
    this.maxMP = rd.readInt();
    this.watk = rd.readInt();
    this.wdef = rd.readInt();
    this.matk = rd.readInt();
    this.mdef = rd.readInt();
    this.speed = rd.readInt();
    this.luck = rd.readInt();
    this.crit = rd.readInt();
    this.critF = rd.readInt();
    this.dodge = rd.readInt();
}
/**
 * General settings·data structure of buff limit
 */
function DSetStateLimit(rd){
    this.cantAtk = rd.readBool();
    this.cantSkill = rd.readBool();
    this.cantItem = rd.readBool();
    this.cantMove = rd.readBool();
    this.cantSquat = rd.readBool();
    this.cantJump = rd.readBool();
    this.cantOutOfCombat = rd.readBool();
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Settings·Data structure of elements
 */
function DSetAttribute(rd){
    var _sf = this;

    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();

    //attack rate
    this.atk = [];
    //defence rate
    this.def = [];
    var length = rd.readInt();

    for (var i = 0; i < length; i++) {
        this.atk[rd.readShort()] = rd.readShort();
    }
    length = rd.readInt();
    for (i = 0; i < length; i++) {
        this.def[rd.readShort()] = rd.readShort();
    }

    /**
     * find the attack and defence rate by the element
     * @param attribute
     * @returns {{def: *, atk: *}}
     */
    this.getNum = function(attribute){
        var def = _sf.def[attribute.id];
        if(def == null){
            def = 0;
        }else{
            def /= 100;
        }
        var atk = _sf.atk[attribute.id];
        if(atk == null) {
            atk = 1;
        }else{
            atk /= 100;
        }
        return {
            atk : atk,
            def : def
        }
    }
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Settings·Data structure of skills
 */
function DSetSkill(rd){
    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();

    //Icon
    this.icon = rd.readString();
    this.mainAttribute = rd.readShort();
    this.otherAttribute = rd.readShort();

    //type of skill
    this.userType = rd.readShort();
    //animation of skill
    this.userAnim = rd.readShort();
    //bullet of skill
    this.bullet = rd.readShort();
    //frequency of bullet
    this.launchTimes = rd.readShort();
    //interval of bullet
    this.launchInterval  = rd.readShort();

    //determination area
    this.triggerAnim = rd.readShort();
    this.triggerX = rd.readShort();
    this.triggerY = rd.readShort();
    this.triggerWidth = rd.readShort();
    this.triggerHeight = rd.readShort();

    //common trigger of skill
    this.eventId = rd.readShort();
    //cost mp
    this.useMp = rd.readInt();

    //power of skill
    this.pow = rd.readInt();
    //CD
    this.cd = rd.readInt();
    //Knockback
    this.repel = rd.readShort();
    //Launcher
    this.fly = rd.readShort();

    //parameter
    this.maxHP = rd.readShort();
    this.maxMP = rd.readShort();
    this.Hp = rd.readShort();
    this.Mp = rd.readShort();
    this.watk = rd.readShort();
    this.wdef = rd.readShort();
    this.matk = rd.readShort();
    this.mdef = rd.readShort();
    this.speed = rd.readShort();
    this.luck = rd.readShort();

    this.dispersed = rd.readShort();

    //Casts Animation
    this.readyAction = rd.readShort();
    //action of skill
    this.doAction = rd.readShort();
    //wait for the skill end
    this.waitOverSkill = rd.readBool();
    //Lock Direction
    this.lockDirection = rd.readBool();
    //super Armor
    this.superArmor = rd.readBool();
    //blood Sucking
    this.bloodSucking = rd.readBool();
    //Player Operational Target Area
    this.selectRect = rd.readBool();

    //offset
    this.moveTime = rd.readShort();
    this.moveX = rd.readShort();
    this.moveY = rd.readShort();

    //change state
    this.cState = [];
    var length = rd.readInt();
    for (var i = 0; i < length; i++) {
        this.cState[rd.readShort()] = rd.readShort();
    }
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Settings·Data structure of bullets
 */
function DSetBullet(rd){
    this.id = rd.readShort();
    this.name = rd.readString();
    this.msg = rd.readString();

    //Resource of bullet : image or not
    this.userPic = rd.readBool();
    //Resource of bullet : animation or not
    this.userAnim = rd.readBool();
    //Bullet image file
    this.picFile = rd.readString();
    //Bullet animation ID
    this.animId = rd.readShort();
    //Bullet hit animation
    this.hitAnimId = rd.readShort();

    //Gravity or not
    this.isGravity = rd.readBool();
    //track or not
    this.isTrack = rd.readBool();
    //penetrate or not
    this.isPenetration = rd.readBool();
    //number of bullet
    this.bulletNum = rd.readShort();
    //speed of bullet
    this.bulletSpeed = rd.readShort();
    //angle of bullet
    this.angle = rd.readShort();
    //range of bullet
    this.range = rd.readShort();
    //bullet lifetime
    this.time = rd.readShort();

}/**
 * Created by Yitian Chen on 2019/1/8.
 * Settings·Common Trigger
 */
function DSetEvent(rd){
    this.id = rd.readInt();
    this.name = rd.readString();

    //logic of Execution
    this.logic = new DIf(rd);
    //Parallel or not
    this.isParallel = rd.readBool();
    //Autorun or not
    this.autoRun = rd.readBool();

    //Contents
    this.events = [];

    var length = rd.readInt();
    for(var i = 0;i<length;i++){
        var et = new DEvent();
        et.read(rd);
        this.events.push(et);
    }

    /**
     * Execute trigger
     */
    this.doEvent = function(){
        if(this.logic.result()){
            //dispose the parallel execution common triggers on the map
            if(this.autoRun && this.isParallel && !RF.FindOtherEvent("public_event_" + this.id)){
                RF.AddOtherEvent(this.events , "public_event_" + this.id , -1);
            }else if(!this.autoRun && this.isParallel){//the trigger that executes in the middle of a common trigger, binded on item, enemy death or enemy
                RF.AddOtherEvent(this.events , null , -1);
            }else if(!this.isParallel){//Merge execution in the main loop
                RV.InterpreterMain.addEvents(this.events);
            }
        }
    }
}/**
 * Created by Yitian Chen on 2019/3/14.
 * Music & SE data structure
 */
function DSetSound(rd){
    //File
    this.file = "";
    //volume
    this.volume = 80;

    if(rd != null){
        this.file = rd.readString();
        this.volume = rd.readShort();
    }

    /**
     * Play
     * @param type 0、play BGM 1、play BGS 2、play SE
     */
    this.play = function(type){
        if(this.file == "") return;
        if(type == null) type = 2;
        if(type == 0){
            RV.GameSet.playBGM("Audio/" + this.file , this.volume);
        }else if(type == 1){
            RV.GameSet.playBGS("Audio/" + this.file , this.volume);
        }else if(type == 2){
            RV.GameSet.playSE("Audio/" + this.file , this.volume);
        }
    }

}/**
 * Created by Yitian Chen on 2019/4/29.
 * BUFF execution data structure / BUFF data logic
 * @param cof  Configuration data of buff
 * @param self buff recipient
 */
function DBuff(cof , self){
    //==================================== private attributes ===================================
    var _sf = this;
    //LActor object
    var actor = self.getActor();
    //coordinate
    var x = actor.getCharacter().x;
    var y = actor.getCharacter().y;
    //End mark
    var isEnd = false;
    var tempEnd = false;
    //Configuration data of animation
    var animcof = RV.NowRes.findResAnim(cof.animID);
    //current animation
    var anim = null;
    //buff interval
    var intervalNow = 0;
    var intervalMax = cof.cTimes;
    //change hp&mp
    var minAddHp = self.getMaxHP() * cof.cHP / 100;
    var minAddMp = self.getMaxMp() * cof.cMP / 100;
    //change attck and move speed
    var changeSpeed = 1 + cof.cSpeed / 100;
    //====================================  public attributes ===================================
    //end type
    this.endType = 0;
    //end time
    this.endTime = 0;
    //end HP
    this.endHP = 0;
    //end step
    this.endMove = 0;
    //end callback
    this.endDo = null;
    //==================================== initialize logic ===================================

    if(animcof != null){
        var haveView = true;
        var point = animcof.point;
        if(point.type == 0){//Relative coordinates
            if(point.dir == 5){//scene
                haveView = false;
            }
        }else{//absolute coordinate
            haveView = false;
        }
        if(animcof instanceof DResAnimFrame){
            anim = new LAnim(animcof,haveView ? RV.NowMap.getView() : null,false,actor);
        }else if(animcof instanceof  DResAnimParticle){
            anim = new LParticle(animcof,haveView ? RV.NowMap.getView() : null,false,actor);
        }
    }

    if(cof.RelieveOutOfCombat){
        this.endType = 0;
    }else if(cof.RelieveTime){
        this.endType = 1;
        this.endTime = cof.RTime * 60;
    }else if(cof.RelieveHP){
        this.endType = 2;
        this.endHP = self.sumHp + (self.getMaxHP() * cof.RHP / 100);
    }else if(cof.RelieveMove){
        this.endType = 3;
        if(self instanceof GActor){
            this.endMove = RV.GameData.step + cof.RMove;
        }else{
            this.endMove = actor.moveNum + cof.RMove;
        }
    }

    //==================================== Public function ===================================

    /**
     * Main update
     */
    this.update = function(){
        if(isEnd)return;
        if(tempEnd) {
            _sf.overBuff();
            return;
        }
        //manage end
        if(_sf.endType == 0 && actor.combatTime <= 0){
            tempEnd = true;
            return;
        }
        if(_sf.endType == 1 && _sf.endTime <= 0){
            tempEnd = true;
            return;
        }
        if(_sf.endType == 2 && self.sumHp > this.endHP){
            tempEnd = true;
            return;
        }if(_sf.endType == 3){
            if(self instanceof GActor && RV.GameData.step > _sf.endMove){
                tempEnd = true;
                return;
            }else if(self.moveNum > _sf.endMove){
                tempEnd = true;
                return;
            }
        }
        actor = self.getActor();
        if(_sf.endType == 1) _sf.endTime -= 1;
        if(anim != null) anim.update();
        if(intervalNow <= 0){
            x = actor.getCharacter().x;
            y = actor.getCharacter().y;
            intervalNow = intervalMax;
            //change HP
            if(cof.cHpBool){
                if(self instanceof LEnemy){
                    actor.injure(0 , minAddHp * -1);
                }else{
                    self.hp += minAddHp;
                    new LNum(0 , minAddHp * -1 , RV.NowMap.getView() , x , y);
                }
            }
            if(cof.cMpBool){
                self.mp += minAddMp;
                new LNum(2 , minAddMp , RV.NowMap.getView() , x , y);
            }
            //change speed
            if(cof.cSpeedBool){
                actor.speedEfficiency = changeSpeed;
            }
        }
        intervalNow -= 1;
        //invincible and SuperArmor
        if(cof.invincible){
            actor.invincible(60);
        }
        if(cof.superArmor){
            actor.superArmor = true;
        }
        if(cof.limit.cantAtk){
            self.LAtk = true;
        }
        if(cof.limit.cantSkill){
            self.LSkill = true;
        }
        if(cof.limit.cantItem){
            self.LItem = true;
        }
        if(cof.limit.cantMove){
            self.LMove = true;
        }
        if(cof.limit.cantSquat){
            self.LSquat = true;
        }
        if(cof.limit.cantJump){
            self.LJump = true;
        }
        if(cof.limit.cantOutOfCombat){
            self.LOutOfCombat = true;
        }

    };
    /**
     * buff end
     */
    this.overBuff = function(){
        isEnd = true;
        _sf.dispose();
        if(cof.invincible){
            //actor.endIncible();
        }
        if(cof.superArmor){
            actor.superArmor = false;
        }

        if(cof.limit.cantAtk){
            self.LAtk = false;
        }
        if(cof.limit.cantSkill){
            self.LSkill = false;
        }
        if(cof.limit.cantItem){
            self.LItem = false;
        }
        if(cof.limit.cantMove){
            self.LMove = false;
        }
        if(cof.limit.cantSquat){
            self.LSquat = false;
        }
        if(cof.limit.cantJump){
            self.LJump = false;
        }
        if(cof.limit.cantOutOfCombat){
            self.LOutOfCombat = false;
        }
        if(cof.cSpeedBool){
            actor.speedEfficiency = 1;
        }
        if(_sf.endDo != null) _sf.endDo();
    };

    /**
     * get buff data
     * @returns {DSetState}
     */
    this.getData = function(){
        return cof;
    };
    /**
     * get icon file of buff
     * @returns {string}
     */
    this.getIcon = function(){
        if(cof != null){
            return cof.pic;
        }
        return null;
    };
    /**
     * dispose buff
     */
    this.dispose = function(){
        if(anim != null) anim.dispose();
    }


}/**
 * Created by Yitian Chen on 2019/3/15.
 * items and inventory
 * @param type | type 0 item   1 weapons  2 armor
 * @param id | id of item
 * @param num | number of item
 */
function DBagItem(type,id,num){
    this.type = type;
    this.id = id;
    this.num = num;

    /**
     * use items
     * @param num | number
     * @returns {boolean}
     */
    this.user = function(num){
        if(this.type != 0 || num > this.num) return false;
        var cof = this.findData();
        if(cof == null || cof.userType == 0) return false;
        if(IVal.scene instanceof SMain){
            RV.NowCanvas.playAnim(cof.userAnim,null,RV.NowMap.getActor(),true);
            RV.NowMap.getActor().getCharacter().setAction(cof.userAction,false,true,true);
        }else{
            cof.se.play();
        }
        var addHp = RV.GameData.actor.getMaxHP() * (cof.HpNum1 / 100) + cof.HpNum2;
        var temp = cof.dispersed / 100;
        var d1 = addHp * (1 - temp);
        var d2 = addHp * (1 + temp);
        addHp = rand(Math.floor(d1),Math.ceil(d2));

        var addMp = RV.GameData.actor.getMaxMp() * (cof.MpNum1 / 100) + cof.MpNum2;
        d1 = addMp * (1- temp);
        d2 = addMp * (1 + temp);
        addMp = rand(Math.floor(d1),Math.ceil(d2));

        var x = RV.NowMap.getActor().getCharacter().x;
        var y = RV.NowMap.getActor().getCharacter().y;

        var userRect = new IRect(1,1,1,1);
        if(RV.NowMap.getActor().getDir() == 0){
            userRect.x = x + cof.triggerX * RV.NowProject.blockSize;
            userRect.y = y + cof.triggerY * RV.NowProject.blockSize;
            userRect.width = cof.triggerWidth * RV.NowProject.blockSize;
            userRect.height = cof.triggerHeight * RV.NowProject.blockSize;
        }else{
            userRect.right = x - (cof.triggerX - 1) * RV.NowProject.blockSize;
            userRect.y = y + cof.triggerY * RV.NowProject.blockSize;
            userRect.left = userRect.right - cof.triggerWidth * RV.NowProject.blockSize;
            userRect.height = cof.triggerHeight * RV.NowProject.blockSize;
        }
        if(IVal.DEBUG){
            var ss = new ISprite(IBitmap.CBitmap(userRect.width,userRect.height),RV.NowMap.getView());
            ss.x = userRect.x;
            ss.y = userRect.y;
            ss.z = 160;
            ss.drawRect(new IRect(0,0,ss.width,ss.height),new IColor(255,125,0,255));
            ss.fadeTo(0,60);
            ss.setOnEndFade(function(s){s.dispose()});
        }


        if(cof.userType == 1){//actor
            if(cof.upType == 0){
                RV.GameData.actor.addPow.maxHp += cof.upValue;
            }else if(cof.upType == 1){
                RV.GameData.actor.addPow.maxMp += cof.upValue;
            }else if(cof.upType == 2){
                RV.GameData.actor.addPow.watk += cof.upValue;
            }else if(cof.upType == 3){
                RV.GameData.actor.addPow.wdef += cof.upValue;
            }else if(cof.upType == 4){
                RV.GameData.actor.addPow.matk += cof.upValue;
            }else if(cof.upType == 5){
                RV.GameData.actor.addPow.mdef += cof.upValue;
            }else if(cof.upType == 6){
                RV.GameData.actor.addPow.speed += cof.upValue;
            }else if(cof.upType == 7){
                RV.GameData.actor.addPow.luck += cof.upValue;
            }
            if(addMp != 0){
                new LNum(2 , addMp , RV.NowMap.getView() , x , y);
            }
            if(addHp != 0){
                new LNum(0 , addHp * -1 , RV.NowMap.getView() , x , y);
            }
            RV.GameData.actor.mp += addMp;
            RV.GameData.actor.hp += addHp;
            for(var id in cof.cState){
                if(cof.cState[id] == 1){
                    RV.GameData.actor.addBuff(id);
                }else if(cof.cState[id] == 2){
                    RV.GameData.actor.subBuff(id);
                }
            }

        }else if(cof.userType == 2){//projectile
            RV.NowCanvas.playBullet(cof.bullet,RV.NowMap.getActor() , x , y , {value1:addHp , value2:addMp, buff:cof.cState});
        }else if(cof.userType == 3){//1 nearest enemy in scope
            var dis = 999999;
            var tempEnemy = null;
            for(var i = 0;i<RV.NowMap.getEnemys().length;i++){
                var tempRect = RV.NowMap.getEnemys()[i].getRect();
                //enemy in scope
                if(userRect.intersects(tempRect)){
                    //Calculate distance between two points
                    var tempDis = Math.abs( Math.sqrt( Math.pow((x - tempRect.centerX),2) + Math.pow((y - tempRect.centerY),2) ) );
                    if(tempDis < dis){
                        dis = tempDis;
                        tempEnemy = RV.NowMap.getEnemys()[i];
                    }
                }
            }
            //execution
            if(tempEnemy != null){
                handleHPMP(tempEnemy.getActor(),addHp,addMp);
                RV.NowCanvas.playAnim(cof.triggerAnim,null,tempEnemy.getActor(),true);
                //add BUFF
                for(var id in cof.cState){
                    if(cof.cState[id] == 1){
                        tempEnemy.addBuff(id);
                    }else if(cof.cState[id] == 2){
                        tempEnemy.subBuff(id);
                    }
                }
            }
        }else if(cof.userType == 4){//1 Random Enemy in Scope
            tempEnemy = null;
            var tempList = [];
            for(i = 0;i<RV.NowMap.getEnemys().length;i++){
                tempRect = RV.NowMap.getEnemys()[i].getRect();
                //enemy in scope
                if(userRect.intersects(tempRect)){
                    tempList.push(RV.NowMap.getEnemys()[i]);
                }
            }
            tempEnemy = RF.RandomChoose(tempList);
            //execution
            if(tempEnemy != null){
                handleHPMP(tempEnemy.getActor(),addHp,addMp);
                RV.NowCanvas.playAnim(cof.triggerAnim,null,tempEnemy.getActor(),true);
                //add BUFF
                for(var id in cof.cState){
                    if(cof.cState[id] == 1){
                        tempEnemy.addBuff(id);
                    }else if(cof.cState[id] == 2){
                        tempEnemy.subBuff(id);
                    }
                }
            }
        }else if(cof.userType== 5){//All Enemies in Scope
            tempList = [];
            for(i = 0;i<RV.NowMap.getEnemys().length;i++){
                tempRect = RV.NowMap.getEnemys()[i].getRect();
                //enemy in scope
                if(userRect.intersects(tempRect)){
                    tempList.push(RV.NowMap.getEnemys()[i]);
                }
            }
            RV.NowCanvas.playAnim(cof.triggerAnim,null,null,true,userRect);
            for(i = 0;i<tempList.length;i++){
                tempEnemy = tempList[i];
                if(tempEnemy != null){
                    handleHPMP(tempEnemy.getActor(),addHp,addMp);
                    //add BUFF
                    for(var id in cof.cState){
                        if(cof.cState[id] == 1){
                            tempEnemy.addBuff(id);
                        }else if(cof.cState[id] == 2){
                            tempEnemy.subBuff(id);
                        }
                    }
                }
            }
        }
        //execution
        var trigger = RV.NowSet.findEventId(cof.eventId);
        if(trigger != null){
            trigger.doEvent();
        }
        var nowNum = num - 1;
        if(nowNum > 0){
            this.user(nowNum);
        }
        return true;
    };

    /**
     * change parameter
     * @param actor 
     * @param addHp | hp increment
     * @param addMp | mp increment
     */
    function handleHPMP(actor,addHp,addMp){
        if(addMp != 0){
            actor.injure(4 , addMp );
        }
        if(addHp != 0){
            actor.injure(0 , addHp );
        }
    }


    /**
     * find data
     * @returns {DSetArmor|null|DSetItem|DSetArms}
     */
    this.findData = function(){
        if(this.type == 0){
            return RV.NowSet.findItemId(this.id);
        }else if(this.type == 1){
            return RV.NowSet.findArmsId(this.id);
        }else if(this.type == 2){
            return RV.NowSet.findArmorId(this.id);
        }
        return null;
    }
}/**
 * Created by 七夕小雨 on 2019/06/20.
 */ /**
 * GMain Game General Data
 * Created by Yitian Chen on 2019/3/14.
 */
function GMain(){
    //Actor Data
    this.actor = null;
    //life
    this.life = 0;
    //variable
    this.value = [];
    //self Switch
    this.selfSwitch = [];
    //Current map Id
    this.mapId = 0;
    //Current x
    this.x = 0;
    //Current y
    this.y = 0;
    //Current direction
    this.dir = 0;
    //gold
    this.money = 0;
    //items in inventory
    this.items = [];
    //skills in Skill Shortcuts
    this.userSkill = [0,0,0,0,0];
    //items in Item Shortcuts
    this.userItem = [0,0,0,0];
    //Actor has gravity or not
    this.isGravity = true;
    //Gravity Coefficient
    this.gravityNum = 0;
    //Jump Coefficient
    this.jumpNum = 0;
    //Jump Frequency
    this.jumpTimes = 0;
    //Actor can penetrate or not
    this.isCanPenetrate = false;
    //step of actor
    this.step = 0;
    //count enemies
    this.enemyIndex = 100000;
    //data of current map
    this.mapData = null;

    this.uiHp = RV.NowSet.setAll.uiHp;
    this.uiLife = RV.NowSet.setAll.uiLife;
    this.uiMp = RV.NowSet.setAll.uiMp;
    this.uiExp = RV.NowSet.setAll.uiExp;
    this.uiMenu = RV.NowSet.setAll.uiMenu;
    this.uiItems = RV.NowSet.setAll.uiItems;
    this.uiSkill = RV.NowSet.setAll.uiSkill;
    this.uiPhone = RV.NowSet.setAll.uiPhone;
    this.uiMoney = RV.NowSet.setAll.uiMoney;
    /**
     * Initialize game data
     */
    this.init = function(){
        this.actor = new GActor();
        this.actor.init(RV.NowSet.findActorId(RV.NowSet.setAll.startActorID));
        var data = IRWFile.LoadKV(RV.NowProject.key);
        this.life = RV.NowSet.setAll.life;
        this.value = RV.NowProject.initValue(data != null ? data.value : null);
        this.mapId = RV.NowProject.startId;
        this.x = RV.NowProject.startX;
        this.y = RV.NowProject.startY;
        this.isGravity = RV.NowSet.setAll.haveGravity;
        this.gravityNum = RV.NowSet.setAll.gravityNum;
        this.jumpNum = RV.NowSet.setAll.jumpSpeed;
        this.jumpTimes = RV.NowSet.setAll.jumpTimes;
        this.isCanPenetrate = false;
        this.money = 0;
        this.items = [];
        this.selfSwitch = [];
        this.userSkill = [0,0,0,0,0];
        this.userItem = [0,0,0,0];
        this.enemyIndex = 100000;

        this.uiHp = RV.NowSet.setAll.uiHp;
        this.uiLife = RV.NowSet.setAll.uiLife;
        this.uiMp = RV.NowSet.setAll.uiMp;
        this.uiExp = RV.NowSet.setAll.uiExp;
        this.uiMenu = RV.NowSet.setAll.uiMenu;
        this.uiItems = RV.NowSet.setAll.uiItems;
        this.uiSkill = RV.NowSet.setAll.uiSkill;
        this.uiPhone = RV.NowSet.setAll.uiPhone;
        this.uiMoney = RV.NowSet.setAll.uiMoney;

    };


    /**
     * Save Data of game
     */
    this.save = function(){

        var nowActor = RV.NowMap.getActor();
        var point = nowActor.getXY();
        this.mapId = RV.NowMap.getData().id;
        this.x = point.x;
        this.y = point.y;
        this.dir = nowActor.getDir();

        var info = {
            actor : this.actor.save(),
            life : this.life,
            value : this.value,
            mapId : this.mapId,
            x : this.x,
            y : this.y,
            dir : this.dir,
            money : this.money,
            items : this.items,
            userSkill : this.userSkill,
            userItem : this.userItem,
            isGravity : this.isGravity,
            gravityNum : this.gravityNum,
            jumpNum : this.jumpNum,
            jumpTimes : this.jumpTimes,
            isCanPenetrate : this.isCanPenetrate,
            step : this.step,
            enemyIndex : this.enemyIndex,

            bgmFile : RV.GameSet.nowBGMFile,
            bgmVolume : RV.GameSet.nowBGMVolume,
            bgsFile : RV.GameSet.nowBGSFile,
            bgsVolume : RV.GameSet.nowBGSVolume,

            uiHp : this.uiHp,
            uiLife : this.uiLife,
            uiMp : this.uiMp,
            uiExp : this.uiExp,
            uiMenu : this.uiMenu,
            uiItems : this.uiItems,
            uiSkill : this.uiSkill,
            uiPhone : this.uiPhone,
            uiMoney : this.uiMoney,

            mapData : RV.NowMap.saveMap(),
            selfSwitch : this.selfSwitch

        };
        IRWFile.SaveKV(RV.NowProject.key,info);
    };

    /**
     * Load Data of game
     */
    this.load = function(){
        var info = IRWFile.LoadKV(RV.NowProject.key);
        if(info != null){
            this.actor = new GActor();
            this.actor.load(info.actor);
            this.life = info.life;
            //this.value = RV.NowProject.initValue(null);
            //for(var key in info.value){
            //    this.value[key] = info.value[key];
            //}
            this.value = RV.NowProject.initValue(info.value);
            for(var key in info.value){
                this.value[key] = info.value[key];
            }
            this.mapId = info.mapId;
            this.x = parseInt(info.x / RV.NowProject.blockSize);
            this.y = parseInt(info.y / RV.NowProject.blockSize);
            this.dir = info.dir;
            this.money = info.money;
            this.userSkill = info.userSkill;
            this.isGravity = info.isGravity;
            this.gravityNum = info.gravityNum;
            this.jumpNum = info.jumpNum;
            this.jumpTimes = info.jumpTimes;
            this.isCanPenetrate = info.isCanPenetrate;
            this.step = info.step;
            this.enemyIndex = info.enemyIndex;
            //Recover items
            this.items = [];
            this.userItem = [0,0,0,0];
            for(var i = 0;i<info.items.length;i++){
                this.items.push(new DBagItem(info.items[i].type,info.items[i].id,info.items[i].num))
            }
            for(i = 0;i<info.userItem.length;i++){
                if(info.userItem[i] != 0 && info.userItem[i].num > 0){
                    this.userItem[i] = this.findItem(info.userItem[i].type,info.userItem[i].id);
                }else{
                    this.userItem[i] = 0;
                }
            }
            //Recover BGM，BGS
            RV.GameSet.playBGM(info.bgmFile,info.bgmVolume);
            RV.GameSet.playBGS(info.bgsFile,info.bgsVolume);
            //Recover UI
            this.uiHp = info.uiHp === true;
            this.uiLife = info.uiLife === true;
            this.uiMp = info.uiMp === true;
            this.uiExp = info.uiExp === true;
            this.uiMenu = info.uiMenu === true;
            this.uiItems = info.uiItems === true;
            this.uiSkill = info.uiSkill === true;
            this.uiPhone = info.uiPhone === true;
            this.uiMoney = info.uiMoney === true;

            this.mapData = info.mapData;

            this.selfSwitch = info.selfSwitch;

            return true;
        }

        return false;

    };

    this.getMapData = function(){
        return this.mapData;
    };

    this.clearMapData = function(){
        this.mapData = null;
    };


    /**
     * Add items
     * @param type  | item type 0 item 1 weapons 2armor
     * @param id    | item Id
     * @param num   | number of items
     */
    this.addItem = function(type , id , num){
        var item = new DBagItem(type , id , num);
        var have = false;
        for(var i = 0; i < this.items.length ; i++){
            if(this.items[i].type == type && this.items[i].id == id){
                this.items[i].num += num;
                if(this.items[i].num > 99){
                    this.items[i].num = 99;
                }
                if(this.items[i].num <= 0){
                    this.items.splice(i, 1);
                }
                have = true;

            }
        }
        if(!have && num > 0){
            this.items.push(item);
        }
        var tempItemId = [];
        for(i = 0; i< RV.GameData.userItem.length; i++){
            tempItemId.push(RV.GameData.userItem[i].id)
        }
        if(tempItemId.indexOf(item.id) == -1 && item.type == 0){
            for(i = 0; i< RV.GameData.userItem.length; i++){
                if(RV.GameData.userItem[i] == 0){
                    RV.GameData.userItem[i] = item;
                    break
                }
            }
        }

    };
    /**
     * discard items
     * @param item
     * @param num
     * @returns {boolean}
     */
    this.discardItem = function(item,num){
        for(var i = 0; i < this.items.length ; i++){
            if(this.items[i].type == item.type && this.items[i].id == item.id){
                this.items[i].num -= num;
                if(this.items[i].num <= 0){
                    this.items.splice(i, 1);
                }
                return true;
            }
        }
    };

    /**
     * use items
     * @param id | item id
     * @param num | number of item
     * @param type | item type
     * @returns {boolean} | use successfully or not
     */
    this.useItem = function(id,num,type){
        if(this.actor.LItem) return false;
        var tp = type == null ? 0 : type;
        for(var i = 0;i<this.items.length;i++){
            if(this.items[i].type == tp && this.items[i].id == id && this.items[i].num >= num){
                if(tp == 0 && this.items[i].user(num)){
                    var cof = this.items[i].findData();
                    if(cof != null && cof.noExpend){//Non-consumable
                        return true;
                    }
                    this.items[i].num -= num;
                    if(this.items[i].num <= 0){
                        this.items.splice(i, 1);
                    }
                    return true;
                }else if(tp != 0){
                    this.items[i].num -= num;
                    if(this.items[i].num <= 0){
                        this.items.splice(i, 1);
                    }
                    return true;
                }
                return false;
            }
        }
        return false;
    };
    /**
     * Fine items
     * @param type | item type
     * @param id | item ID
     * @returns {null|*}
     */
    this.findItem = function(type,id){
        for(var i = 0;i<this.items.length;i++){
            if(this.items[i].type == type && this.items[i].id == id){
                return this.items[i];
            }
        }
        return null;
    };

    /**
     * Get the value of variable
     * @param id | variable ID
     * @returns {string|*}
     */
    this.getValues = function(id){
        var val = this.value[id];
        if(val === true || val === false){
            return val ? "ON" : "OFF";
        }else if(!isNaN(val)){
            return val;
        }else if(typeof(val)=='string'){
            var str = val.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]",CharToAScII(203)+  "[$1]");
            var end = "";
            while(true){
                if(str.length <= 0){
                    break;
                }
                var min = str.substring(0,1);
                str = str.substring(1,str.length);
                var c = min.charCodeAt(0);
                if(c == 203){
                    var returnS = TextToTemp(str , "[","]","\\[([a-zA-Z0-9-_]+)]");
                    str = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
                }else{
                    end += min;
                }
            }
            return end;
        }
        return "null";
    };

    /**
     * Text regular extraction
     * @param mainText | The string need to be extracted
     * @param s | Front special sign
     * @param e | Rear special sign
     * @param rex | Regular expression
     * @returns {*[]} content after extracted 
     */
    function TextToTemp( mainText, s, e, rex){
        var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
        mainText = mainText.substring(tmp.length + s.length + e.length, mainText.length);
        var temp1 = tmp.replaceAll(rex, "$1");
        var temp_2 = temp1.replaceAll(" ", "");
        var temp_e = temp_2.replaceAll("，", ",");
        return [temp_e,mainText];
    }

    /**
     * char change to AscII
     * @param num | char code
     * @returns {string}
     */
    function CharToAScII( num) {
        return String.fromCharCode(num);
    }

    /**
     * Get the object of variable
     * @param id | variable ID
     * @param value | if variable is null，a default variable will be set
     * @returns {*}
     */
    this.getValue = function(id , value){
        var val = this.value[id];
        if(val == null){
            return value;
        }
        return val;
    };

    /**
     * Get variable
     * @param id  | variable ID
     * @param value | if variable is null，a default variable will be set
     * @returns {*}
     */
    this.getValueNum = function(id,value){
        var val = this.value[id];
        if(val == null){
            return value;
        }
        if(!isNaN(val)){
            return val;
        }
        return value;
    }

}


/**
 * have save file or not；
 * @returns {boolean}
 */
GMain.haveFile = function(){
    var data = IRWFile.LoadKV(RV.NowProject.key);
    return data != null;
};/**
 * Created by Yitian Chen on 2019/3/14.
 *
 * External variables
 *
 * level     current LV      read-only
 * hp        current HP      read and write
 * mp        current MP      read and write
 * exp       current EXP      read and write
 * maxExp    current maxExp  read and write
 * equips    current equipments      read and write
 * skill     current skills      read and write
 * buff      current buff      read and write
 * levelUpDo levelUp callback(lv)  read and write
 *
 *
 * External function
 *
 * void   -> init(data) Use the data function to create a GActor data function as a DSetActor object, which can be obtained through RV.NowSet.findActorId (id)
 * obj    -> save() save data and return value to gmain for saving
 * void   -> load() load data and Assign value to current object
 * bool   -> studySkill(id) learn skill id is the id of skill ；Successful learning：return true，fail： return false
 * DSetActor -> getSetData() get Configuration data of actor
 * number -> getMaxHP() get current MaxHP
 * number -> getMaxMP() get current MaxMP
 * number -> getWAtk()  get current Attack
 * number -> getWDef() get current Defense
 * number -> getMAtk()  get current M.Attack
 * number -> getMDef()  get current M.Defense
 * number -> getSpeed() get current Speed
 * number -> getLuck()  get current Luck
 */

function GActor(){
    var _sf = this;
    //Actor ID
    var actorId = 0;
    //Actor level
    var lv = 0;
    Object.defineProperty(this, "level", {
        get: function () {
            return lv;
        }
    });

    //current HP
    var nowHp = 0;
    Object.defineProperty(this, "hp", {
        get: function () {
            return nowHp;
        },
        set: function (value) {
            if(value >= _sf.getMaxHP()){
                nowHp = _sf.getMaxHP();
            }else if(value <= 0){
                nowHp = 0;
                if(!RV.NowMap.getActor().isDie){
                    RV.NowMap.getActor().deathDo();
                }
            }else{
                nowHp = parseInt(value);
            }
            //revive
            if(RV.IsDie && RV.NowMap.getActor().isDie && nowHp > 0){
                RV.IsDie = false;
                RV.NowMap.getActor().isDie = false;
                RV.NowMap.getActor().getCharacter().getSpirte().stopAnim();
                RV.NowMap.getActor().getCharacter().getSpirte().pauseAnim();
                RV.NowMap.getActor().getCharacter().getSpirte().visible = true;
                RV.NowMap.getActor().getCharacter().getSpirte().opacity = 1.0;
                RV.NowMap.getActor().getCharacter().actionCall = null;
                RV.NowMap.getActor().getCharacter().setAction(0,false,false,false,true);
                RV.NowMap.getActor().invincible(2);
            }
        }
    });

    //current MP
    var nowMp = 0;
    Object.defineProperty(this, "mp", {
        get: function () {
            return nowMp;
        },
        set: function (value) {
            if(value >= _sf.getMaxMp()){
                nowMp = _sf.getMaxMp();
            }else if(value <= 0){
                nowMp = 0;
            }else{
                nowMp = value;
            }
        }
    });

    //current Exp
    var nowExp = 0;
    Object.defineProperty(this, "exp", {
        get: function () {
            return nowExp;
        },
        set: function (value) {
            if(value >= nowMaxExp && lv < setData.maxLevel){//level up
                var tempExp = value - nowMaxExp;
                _sf.levelUp(1,tempExp);
                _sf.hp = _sf.getMaxHP();
                _sf.mp = _sf.getMaxMp();
            }else if(value <= 0){
                nowExp -= value;
                if(nowExp < 0){
                    nowExp = 0;
                }
            }else{
                nowExp = value;
            }
            if(nowExp > nowMaxExp && lv < setData.maxLevel){
                _sf.exp = nowExp;
            }
        }
    });
    //Max Exp
    var nowMaxExp = 0;
    Object.defineProperty(this, "maxExp", {
        get: function () {
            return nowMaxExp;
        }
    });

    this.name = "";

    //current equipments
    this.equips = {
        arms : 0,
        helmet : 0,
        armor : 0,
        shoes : 0,
        ornaments : 0
    };

    this.addPow = {
        maxHp : 0,
        maxMp :0,
        watk : 0,
        wdef :.0,
        matk :0,
        mdef : 0,
        speed : 0,
        luck : 0
    };
    //skills that actor have learned
    this.skill = [];
    
    //current buff of actor
    this.buff = [];
    var setData = null;
    var powBase = {};
    var cacheEquip = null;
    var cacheDefBuff = [];
    this.levelUpDo = null;
    this.sumHp = 0;
    this.LAtk = false;
    this.LSkill = false;
    this.LItem = false;
    this.LMove = false;
    this.LSquat = false;
    this.LJump = false;
    this.LOutOfCombat = false;

    //initialize data
    this.init = function(data){
        setData = data;
        actorId = data.id;
        lv = data.minLevel;
        powBase = data.getPowForLevel(this.level);

        nowExp = 0;
        nowMaxExp = powBase.maxExp;

        this.name = data.name;

        this.equips.arms      = data.armsId;
        this.equips.helmet    = data.helmetId;
        this.equips.armor     = data.armorId;
        this.equips.shoes    = data.shoesId;
        this.equips.ornaments = data.ornamentsId;

        nowHp = _sf.getMaxHP();
        nowMp = _sf.getMaxMp();

        _sf.skill = [];

        for(var i = 0;i < data.skills.length;i++){
            if(lv >= data.skills[i].level){
                _sf.studySkill(data.skills[i].skillId);
            }
        }
    };

    /**
     * change the data of actor
     * @param data
     */
    this.changeData = function(data,isInit){
        //forget the skills of old actor
        for(var i = 0;i < setData.skills.length;i++){
            if(lv >= setData.skills[i].level){
                _sf.forgetSkill(setData.skills[i].skillId);
            }
        }
        for(i = 0;i<RV.GameData.userSkill.length;i++){
            RV.GameData.userSkill[i] = 0;
        }
        setData = data;
        actorId = data.id;
        if(isInit){
            lv = data.minLevel;
        }
        powBase = data.getPowForLevel(this.level);
        nowMaxExp = powBase.maxExp;
        RV.NowMap.getActor().atkType = setData.attackType;
        RV.NowMap.bulletId = _sf.getBulletAnimId();
        this.name = data.name;
        for(i = 0;i < data.skills.length;i++){
            if(lv >= data.skills[i].level){
                _sf.studySkill(data.skills[i].skillId);
            }
        }

    };
    /**
     * save game
     * @returns obj
     */
    this.save = function(){
        return {
            actorId : actorId,
            level : lv,
            hp : nowHp,
            mp : nowMp,
            exp : nowExp,
            name : this.name,
            equips : _sf.equips,
            skill : _sf.skill,
            addPow : _sf.addPow
        };
    };

    /**
     * load game
     * @param info
     */
    this.load = function(info){
        actorId = info.actorId;
        lv = info.level;
        nowHp = info.hp;
        nowMp = info.mp;
        nowExp = info.exp;

        this.name = info.name;

        this.equips = info.equips;
        this.skill = info.skill;
        this.addPow = info.addPow;

        setData = RV.NowSet.findActorId(actorId);
        powBase = setData.getPowForLevel(lv);
        nowMaxExp = powBase.maxExp;
    };

    /**
     * equip
     * @param item equipment
     */
    this.equipLoad = function(item){
        if(item.type == 0) return;
        if(item.type == 1) {
            this.equipUnload(0);
            this.equips.arms = item.id;
            RV.GameData.useItem(item.id,1,1);
        }else if(item.type == 2){
            var data = RV.NowSet.findArmorId(item.id);
            if(data == null) return;
            if(data.type == 0){
                this.equipUnload(1);
                this.equips.helmet = data.id;
            }else if(data.type == 1){
                this.equipUnload(2);
                this.equips.armor = data.id;
            }else if(data.type == 2){
                this.equipUnload(3);
                this.equips.shoes = data.id;
            }else if(data.type == 3){
                this.equipUnload(4);
                this.equips.ornaments = data.id;
            }
            RV.GameData.useItem(item.id,1,2);
        }

    };

    /**
     * Unload equipment
     * @param part | the type of equipment
     */
    this.equipUnload = function(part){
        if(part == 0){
            var id = this.equips.arms;
            if(id > 0){
                RV.GameData.addItem(1 , id , 1);
                this.equips.arms = 0;
            }
        }else if(part == 1){
            id = this.equips.helmet;
            if(id > 0){
                RV.GameData.addItem(2 , id , 1);
                this.equips.helmet = 0;
            }
        }else if(part == 2){
            id = this.equips.armor;
            if(id > 0){
                RV.GameData.addItem(2 , id , 1);
                this.equips.armor = 0;
            }
        }else if(part == 3){
            id = this.equips.shoes;
            if(id > 0){
                RV.GameData.addItem(2 , id , 1);
                this.equips.shoes = 0;
            }
        }else if(part == 4){
            id = this.equips.ornaments;
            if(id > 0){
                RV.GameData.addItem(2 , id , 1);
                this.equips.ornaments = 0;
            }
        }
    };

    /**
     * learn skill
     * @param id skill id
     * @returns {boolean} Whether learning is successful
     */
    this.studySkill = function(id){
        var skill = RV.NowSet.findSkillId(id);
        if(skill != null && this.skill.indexOf(id) < 0){
            this.skill.push(id);
            for(var i = 0; i< RV.GameData.actor.skill.length; i++){
                if(RV.GameData.userSkill.indexOf(RV.GameData.actor.skill[i]) == -1){
                    for(var j = 0; j< RV.GameData.userSkill.length; j++){
                        if(RV.GameData.userSkill[j] == 0){
                            RV.GameData.userSkill[j] = RV.GameData.actor.skill[i];
                            break
                        }
                    }
                }
            }
            return true;
        }
        return false;
    };

    /**
     * forget skill
     * @param id
     */
    this.forgetSkill = function(id){
        if(this.skill.indexOf(id) >= 0){
            this.skill.remove(id);
        }
    };
    /**
     * gte actor ID
     * @returns {number}
     */
    this.getActorId = function(){
        return actorId;
    };
    /**
     * get the object of actor
     * @returns {LActor| null}
     */
    this.getActor = function(){
        return RV.NowMap.getActor();
    };

    /**
     * get the data of actor
     * @returns {DSetActor} setActor
     */
    this.getSetData = function(){
        return setData;
    };

    /**
     * get current Max HP
     * @returns {*} Max HP
     */
    this.getMaxHP = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].maxHP;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().maxHP;
        }
        return powBase.maxHp + _sf.addPow.maxHp + equipAdd + buffAdd;
    };
    /**
     * get current Max MP
     * @returns {*} Max MP
     */
    this.getMaxMp = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].maxMP;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().maxMP;
        }
        return powBase.maxMp + _sf.addPow.maxMp + equipAdd + buffAdd;
    };
    /**
     * get current Attack
     * @returns {*} Attack
     */
    this.getWAtk = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].watk;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().watk;
        }
        return powBase.watk + _sf.addPow.watk + equipAdd + buffAdd;
    };
    /**
     * get current Defense
     * @returns {*} Defense
     */
    this.getWDef = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].wdef;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().wdef;
        }
        return powBase.wdef + _sf.addPow.wdef + equipAdd + buffAdd;
    };
    /**
     * Get current M.Attack
     * @returns {*} M.Attack
     */
    this.getMAtk = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].matk;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().matk;
        }
        return powBase.matk + _sf.addPow.matk + equipAdd + buffAdd;
    };
    /**
     * get current M.Defense
     * @returns {*} M.Defense
     */
    this.getMDef = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].mdef;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().mdef;
        }
        return powBase.mdef + _sf.addPow.mdef + equipAdd + buffAdd;
    };
    /**
     * get current speed
     * @returns {*} current speed
     */
    this.getSpeed = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].speed;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().speed;
        }
        return powBase.speed + _sf.addPow.speed + equipAdd + buffAdd;
    };
    /**
     * get current luck
     * @returns {*} luck
     */
    this.getLuck = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 0;i<equips.length;i++){
            if(equips[i] != null) equipAdd += equips[i].luck;
        }
        var buffAdd = 0;
        for(i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().luck;
        }
        return powBase.luck + _sf.addPow.luck + equipAdd + buffAdd;
    };
    /**
     * get crit rate
     * @returns {number}
     */
    this.getAddCrit = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().crit;
        }
        return buffAdd;
    };
    /**
     * get crit bonus
     * @returns {number}
     */
    this.getAddCritF = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().critF;
        }
        return buffAdd;
    };
    /**
     * get dodge rate
     * @returns {number}
     */
    this.getAddDodge = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().dodge;
        }
        return buffAdd
    };
    /**
     * get Knockback
     * @returns {number}
     */
    this.getRepel = function(){
        var arms = RV.NowSet.findArmsId(_sf.equips.arms);
        if(arms == null) return 0;
        return arms.repel;
    };
    /**
     * Calculated Elements
     * @param id
     * @returns {{def: *, atk: *}|{def: number, atk: number}}
     */
    this.getAttribute = function(id){
        var arms = RV.NowSet.findArmsId(_sf.equips.arms);
        if(arms == null) return {atk:1,def:0};
        var att = RV.NowSet.findAttributeId(arms.mainAttribute);
        if(att == null) return {atk:1,def:0};
        var eatt = RV.NowSet.findAttributeId(id);
        if(eatt == null) return {atk:1,def:0};
        var att2 = RV.NowSet.findAttributeId(arms.otherAttribute);
        if(att2 == null) return att.getNum(eatt);
        var obj1 = att.getNum(eatt);
        var obj2 = att2.getNum(eatt);
        return {
            atk : obj1.atk + Math.abs(obj2.atk / 2),
            def : obj1.def + Math.abs(obj2.def / 2)
        }

    };
    
    /**
     * get defense Elements
     * @param id
     * @returns {{def: number, atk: number}}
     */
    this.getDefAttrbute = function(id){
        var eatt = RV.NowSet.findAttributeId(id);
        if(eatt == null) return {atk:1,def:0};
        var objs = [];
        objs[0] = getEquipAttbute(_sf.equips.helmet,eatt);
        objs[1] = getEquipAttbute(_sf.equips.arms,eatt);
        objs[2] = getEquipAttbute(_sf.equips.ornaments,eatt);
        objs[3] = getEquipAttbute(_sf.equips.shoes,eatt);
        var atk = 0;
        var def = 0;
        for(var i = 0;i<objs.length;i++){
            if(Math.abs(objs[i].atk) > atk){
                atk = objs[i].atk;
            }
            if(Math.abs(objs[i].def) > def){
                def = objs[i].def;
            }
        }
        return {
            atk : atk,
            def : def
        }
    };

    /**
     * get Elements of every equipment
     * @param equipId
     * @param eatt
     * @returns {{def: *, atk: *}|{def: number, atk: number}}
     */
    function getEquipAttbute(equipId,eatt){
        var eq = RV.NowSet.findArmorId(equipId);
        if(eq == null) return {atk : 1,def : 0};
        var att = RV.NowSet.findAttributeId(eq.mainAttribute);
        if(att == null) return {atk:1,def:0};
        var att2 = RV.NowSet.findAttributeId(eq.otherAttribute);
        if(att2 == null) return att.getNum(eatt);
        var obj1 = att.getNum(eatt);
        var obj2 = att2.getNum(eatt);
        return {
            atk : obj1.atk + Math.abs(obj2.atk / 2),
            def : obj1.def + Math.abs(obj2.def / 2)
        }
    }

    /**
     * get ID of bullet animation
     * @returns {number}
     */
    this.getBulletAnimId = function(){
        eachEquip();
        if(cacheEquip[0] == null){
            return setData.bulletAnimId;
        }else {
            return cacheEquip[0].bulletId;
        }
    };
    /**
     * get Attack Range
     * @returns {number}
     */
    this.getAtkDis = function(){
        eachEquip();
        if(cacheEquip[0] == null){
            return 1;
        }else{
            return cacheEquip[0].atkDistance;
        }

    };

    /**
     * get attack Frequency(Attack interval)
     */
    this.getAtkWait = function(){
        eachEquip();
        if(cacheEquip[0] == null){
            return 35;
        }else{
            return cacheEquip[0].atkInterval;
        }
    };
    /**
     * Get attack additional buff
     * @returns {Array}
     */
    this.getAtkBuffs = function(){
        eachEquip();
        if(cacheEquip[0] == null){
            return [];
        }else{
            return cacheEquip[0].cState;
        }
    };

    /**
     * get the deductible MP
     * @returns {number}
     */
    this.subMp = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 1;i<equips.length;i++){
            if(equips[i] != null && equips[i].useMp) {
                equipAdd += equips[i].useMpValue;
            }
        }
        return equipAdd;
    };
    /**
     * get the deductible HP(by gold)
     * @returns {number}
     */
    this.subMoney = function(){
        var equipAdd = 0;
        var equips = eachEquip();
        for(var i = 1;i<equips.length;i++){
            if(equips[i] != null && equips[i].useMoney) {
                equipAdd += equips[i].useMoneyValue;
            }
        }
        return equipAdd;
    };
    /**
     * get blood Sucking
     * @returns {Array}
     */
    this.getbloodSucking = function(){
        if(cacheEquip[0] == null){
            return [];
        }else{
            return cacheEquip[0].bloodSucking;
        }
    };
    /**
     * add BUFF
     * @param id
     */
    this.addBuff = function(id){
        id = parseInt(id);
        var cof = RV.NowSet.findStateId(id);
        if(cof != null){

            var canAdd = true;
            if(!cof.cantResist && cacheDefBuff[id] != null){
                canAdd = !RF.ProbabilityHit(cacheDefBuff[id] / 100);
            }

            if(canAdd){
                var bf = new DBuff(cof,_sf);
                bf.endDo = function(){
                    _sf.buff.remove(bf);
                };
                _sf.buff.push(bf);
                //buff change
                for(var mid in cof.cState){
                    if(cof.cState[mid] === 1){
                        RV.GameData.actor.addBuff(mid);
                    }else if(cof.cState[mid] === 2){
                        RV.GameData.actor.subBuff(mid);
                    }
                }
            }

        }
    };
    /**
     * remove BUFF
     * @param id
     */
    this.subBuff = function(id){
        id = parseInt(id);
        for(var i = _sf.buff.length - 1;i>=0;i--){
            if(_sf.buff[i].getData().id === id){
                _sf.buff[i].endDo = null;
                _sf.buff[i].overBuff();
                _sf.buff.remove(_sf.buff[i]);
            }
        }
    };


    this.findBuff = function(id){
        for(var i = 0; i < _sf.buff.length;i++){
            if(_sf.buff[i].getData().id === id){
                return _sf.buff[i];
            }
        }
        return null;
    };

    /**
     * update BUFF
     */
    this.updateBuff = function(){
        for(var i = 0;i<_sf.buff.length;i++){
            _sf.buff[i].update();
        }
    };
    /**
     * update equipments
     * @returns {Array}
     */
    this.updateEquip = function(){
        cacheEquip = [];
        cacheEquip.push(RV.NowSet.findArmsId(_sf.equips.arms));
        cacheEquip.push(RV.NowSet.findArmorId(_sf.equips.helmet));
        cacheEquip.push(RV.NowSet.findArmorId(_sf.equips.armor));
        cacheEquip.push(RV.NowSet.findArmorId(_sf.equips.shoes));
        cacheEquip.push(RV.NowSet.findArmorId(_sf.equips.ornaments));
        if(RV.NowMap != null && RV.NowMap.getActor != null && RV.NowMap.getActor() != null){
            RV.NowMap.getActor().bulletId = _sf.getBulletAnimId();
            RV.NowMap.getActor().atkDis = _sf.getAtkDis();
            RV.NowMap.getActor().atkWait = _sf.getAtkWait();
        }
        cacheDefBuff = [];
        for(var i = 1;i<cacheEquip.length;i++){
            if(cacheEquip[i] != null) {
                for(var key in cacheEquip[i].cState){
                    if(cacheDefBuff[key] != null){
                        cacheDefBuff[key] += cacheEquip[i].cState[key];
                    }else{
                        cacheDefBuff[key] = cacheEquip[i].cState[key];
                    }

                }
            }
        }
        return cacheEquip;
    };
    /**
     * level up
     * @param level
     */
    this.levelUp = function(level,overExp){
        nowExp = overExp == null ? 0 : overExp;
        var oldLv = lv;
        lv += level;
        if(lv > 99 ){
            lv = 99;
        }
        if(oldLv < 99){
            powBase = setData.getPowForLevel(lv);
            nowMaxExp = powBase.maxExp;
            RV.NowCanvas.playAnim(RV.NowSet.setAll.actorLevelupAnimId,null,RV.NowMap.getActor(),true);
            //learn skills
            for(var i = 0;i < setData.skills.length;i++){
                if(lv >= setData.skills[i].level){
                    _sf.studySkill(setData.skills[i].skillId);
                }
            }
            if(_sf.levelUpDo != null) _sf.levelUpDo(lv); //levelUp callback
        }
    };

    /**
     * get current equipments
     * @returns {*}
     */
    function eachEquip(){
        var equips = [];
        if(cacheEquip == null){
            equips = _sf.updateEquip();
        }else{
            equips = cacheEquip;
        }
        return equips;
    }

    /**
     * dispose
     */
    this.dispose = function(){
        for(var i = _sf.buff.length - 1;i>=0;i--){
            _sf.buff[i].dispose();
            _sf.buff.remove(_sf.buff[i]);
        }
    }

}
/**
 * Created by Yitian Chen on 2019/6/12 0012.
 * system settings
 */
function GSet(){
    var _sf = this;
    //File of current BGM
    this.nowBGMFile = "";
    //File of current BGS
    this.nowBGSFile = "";
    //Volume of current BGM
    this.nowBGMVolume = 100;
    //Volume of current BGS
    this.nowBGSVolume = 100;

    //Relative music volume
    var musicVolume = 100;
    //Relative SE volume
    var soundVolume = 100;

    //change volume of BGM
    Object.defineProperty(this, "BGMVolume", {
        get: function () {
            return musicVolume;
        },
        set:function(value){
            musicVolume = value;
            _sf.setBGMVolume(_sf.nowBGMVolume * (musicVolume / 100));
            _sf.setBGSVolume(_sf.nowBGSVolume * (musicVolume / 100));
        }
    });
    //change volume of SE
    Object.defineProperty(this, "SEVolume", {
        get: function () {
            return soundVolume;
        },
        set:function(value){
            soundVolume = value;
        }
    });

    /**
     * save settings
     */
    this.save = function(){
        var info = {
            mv : musicVolume,
            sv : musicVolume
        };
        IRWFile.SaveKV(RV.NowProject.key + "_gameinfo",info);
    };
    /**
     * load settings
     */
    this.load = function(){
        var info = IRWFile.LoadKV(RV.NowProject.key + "_gameinfo");
        if(info != null){
            musicVolume = info.mv;
            soundVolume = info.sv;
        }
    };

    /**
     * play BGM
     * @param file 
     * @param volume 
     */
    this.playBGM = function(file,volume){
        _sf.nowBGMFile = file;
        _sf.nowBGMVolume = volume;
        if(_sf.nowBGMFile.length > 0){
            IAudio.playBGM(file , parseInt(volume * (musicVolume / 100)));
        }
    };

    /**
     * play BGS
     * @param file 
     * @param volume 
     */
    this.playBGS = function(file,volume){
        _sf.nowBGSFile = file;
        _sf.nowBGSVolume = volume;
        if(_sf.nowBGSFile.length > 0){
            IAudio.playBGS(file , parseInt(volume * (musicVolume / 100)));
        }
    };

    /**
     * set BGM volume
     * @param volume
     */
    this.setBGMVolume = function(volume){
        if(_sf.nowBGMFile.length > 0){
            IAudio.playBGM(_sf.nowBGMFile , parseInt(volume));
        }
    };

    /**
     * set BGS volume
     * @param volume
     */
    this.setBGSVolume = function(volume){
        if(_sf.nowBGSFile.length > 0){
            IAudio.playBGS(_sf.nowBGSFile , parseInt(volume));
        }
    };

    /**
     * Play SE
     * @param file
     * @param volume
     */
    this.playSE = function(file,volume){
        IAudio.playSE(file,volume * (soundVolume / 100));
    };

    //Play SE “ok”
    this.playEnterSE = function(){
        if(RV.NowSet.setAll.enterSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.enterSound.file , RV.NowSet.setAll.enterSound.volume);
    };

    //Play SE “cancel”
    this.playCancelSE = function(){
        if(RV.NowSet.setAll.cancelSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.cancelSound.file , RV.NowSet.setAll.cancelSound.volume);
    };

    //Play SE “equip”
    this.playEquipSE = function(){
        if(RV.NowSet.setAll.equipSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.equipSound.file , RV.NowSet.setAll.equipSound.volume);
    };

    //Play SE “hurt”
    this.playInjuredSE = function(){
        if(RV.NowSet.setAll.injuredSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.injuredSound.file , RV.NowSet.setAll.injuredSound.volume);
    };

    //Play SE “select”
    this.playSelectSE = function(){
        if(RV.NowSet.setAll.selectSound.file.length < 0) return;
        _sf.playSE("Audio/" + RV.NowSet.setAll.selectSound.file , RV.NowSet.setAll.selectSound.volume);
    };



}/**
 * Created by Yitian Chen on 2018/7/3.
 * Structure of interpreter
 */
function IEventBase(){
    //Initialization
    this.init = function(){
        return false
    };
    //Loop
    this.update = function(){
        return false
    };
    //Finish
    this.finish = function(){
        return true
    };
    //Finish or not
    this.isFinish = function(){
        return this.finish()
    }
}

//Static event queue
function IM(){}/**
 * Created by Yitian Chen on 2018/2/26.
 * Trigger translation
 */
function IList(){
    //Make Event
    this.MakeEvent = function( e, m) {
        if(e == null) return null;
        switch (e.code) {
            case 101: //Show Dialog
                return new IM.Talk(e,m);
            case 102://Show Text
                return new IM.Message(e,m);
            case 103://Show Choices
                return new IM.TextChoice(e,m);
            case 104://Show Tips
                return new IM.Tips(e,m);
            case 105://Show Inquiry
                return new IM.MessageBox(e,m);
            case 106://Close Dialog
                return new IM.CloseTalk(e,m);
            case 107://Close Text
                return new IM.CloseMessage(e,m);
            case 201: //Wait
                return new IM.Wait(e,m);
            case 202: //Variables
                return new IM.Value(e,m);
            case 203: //Conditional Branch
                return new IM.IF(e,m);
            case 204: //Loop
                return new IM.Loop(e,m);
            case 2041://Repeat below
                return new IM.LoopUp(e,m);
            case 205:///Break Loop
                return new IM.LoopBreak(e,m);
            case 206://Common Trigger
                return new IM.Event(e,m);
            case 207://Transfer Player
                return new IM.MapMove(e,m);
            case 208://Game Over
                return new IM.GameOver(e,m);
            case 209://Game Win
                return new IM.GameWin(e,m);
            case 210://Set Trigger Location
                return new IM.TriggerMove(e,m);
            case 211://Self Switches
                return new IM.SelfSwitch(e,m);
            case 301://Flash Screen
                return new IM.Flash(e,m);
            case 302 ://Shake Screen
                return new IM.Shack(e,m);
            case 303: //Fadein Mask
                return new IM.MaskIn(e,m);
            case 304://Fadeout Mask
                return new IM.MakeOut(e,m);
            case 305://Weather Effect
                return new IM.Weather(e,m);
            case 306://Show Picture
                return new IM.PicShow(e,m);
            case 307://Move Picture
                return new IM.PicMove(e,m);
            case 308://Erase Picture
                return new IM.PicDel(e,m);
            case 309://Move Screen
                return new IM.ViewMove(e,m);
            case 310://Reset Screen
                return new IM.ViewReset(e,m);
            case 311://Show Animation
                return new IM.ShowAnim(e,m);
            case 312://Stop Animation
                return new IM.StopAnim(e,m);
            case 401://Set Actor/Trigger Action
                return new IM.EventAction(e,m);
            case 402://Change Actor Parameter
                return new IM.AddActorValue(e,m);
            case 403://Change HP/MP
                return new IM.ChangeHPMP(e,m);
            case 404://Change Skills
                return new IM.ChangeSkill(e,m);
            case 405://Change State
                return new IM.ChangeBuff(e,m);
            case 406://Change Actor
                return new IM.ChangeActor(e,m);
            case 407://Change Equipments
                return new IM.ChangeEquip(e,m);
            case 408://Change Jump Frequency
                return new IM.ChangeJumpNum(e,m);
            case 409://Change Gravity Coefficient
                return new IM.ChangeGravity(e,m);
            case 410://Change Jump Coefficient
                return new IM.ChangeJumpSpeed(e,m);
            case 411://Set Interactive Block Movement
                return new IM.BlockAction(e,m);
            case 412://Change Enemy State
                return new IM.SetEnemy(e,m);
            case 413://Show BOSS HP
                return new IM.BossBar(e,m);
            case 414://Enemy Generate
                return new IM.addEnemy(e,m);
            case 501: //Play BGM
                return new IM.BGMPlay(e,m);
            case 502: //Play BGS
                return new IM.BGSPlay(e,m);
            case 503: //Play SE
                return new IM.SEPlay(e,m);
            case 504: //Fadeout BGM
                return new IM.BGMFade(e,m);
            case 505: //Fadeout BGS
                return new IM.BGSFade(e,m);
            case 506: //Stop SE
                return new IM.SEStop(e,m);
            case 601://Call Shop
                return new IM.Shop(e,m);
            case 602://Call Interface
                return new IM.ShowMenu(e,m);
            case 603://Change Gold
                return  new IM.Money(e,m);
            case 604://Save Game
                return new IM.SaveGame(e,m);
            case 605://Load Game
                return new IM.LoadGame(e,m);
            case 606://Script
                return new IM.Script(e,m);
            case 607://Change Items
                return new IM.AddItems(e,m);
            case 608://Show/Hide All UI
                return new IM.mainUI(e,m);
            case -32286: //MOD
                if(IVal.Mods != null){
                    //Take the first parameter as the Key
                    var key = e.args[0].split('Φ');
                    var mod = IVal.Mods.findMod(key[0]);
                    if(mod.trigger.hasOwnProperty(key[1])){
                        return eval("new " + mod.trigger[key[1]] + "(e,m)");
                    }

                }else{
                    return null;
                }
            default:
                return null;
        }
    }
}/**
 * Created by Yitian Chen on 2018/6/25.
 * Event interpreter
 */
function IMain(){
    //Currently interpreted event
    var event_now = null;
    //Event queue (data)
    this.event_list = [];
    //Event position pointer
    this.pos = -1;
    //Whether the event queue is processed
    this.isEnd = false;
    //stack
    this.indentStack = [];
    //Child event processing
    this.subStory = null;

    var _sf = this;
    //Scene of trigger execution
    this.scene = null;
    //trigger tag
    this.tag = null;
    //current ID of the trigger
    this.NowEventId = -1;

    /**
     * Insert event into current interpretation position
     * @param events | events collection
     */
    this.insertEvent = function(events){
        for(var i = events.length - 1;i>=0;i--){
            this.event_list.splice(this.pos + 1,0,events[i]);
        }
        this.isEnd = false;
    };

    /**
     * Add event to the end of the event interpreter
     * @param events | events collection
     */
    this.addEvents = function(events){
        if(this.event_list.length == 0){
            this.pos = -1;
        }
        this.event_list = this.event_list.concat(events);
        this.isEnd = false;
    };

    /**
     * Forced to end the event interpreter 
     */
    this.endInterpreter = function(){
        this.subStory = null;
        event_now = null;
        this.pos = -1;
        this.isEnd = true;
    };
    /**
     * Event interpreter main loop
     * @returns {boolean}
     */
    this.update = function(){
        if(_sf.isEnd){
            return false;
        }
        if(_sf.subStory != null && _sf.subStory.isEnd){
            _sf.subStory = null;
        }
        if(_sf.subStory != null && !_sf.subStory.isEnd){
            _sf.subStory.update();
            return true;
        }
        while(true){
            if(event_now == null && _sf.isEnd){
                break;
            }
            if(event_now == null || event_now.isFinish()){
                if(event_now != null){
                    event_now.finish();
                }
                if(poaAdd()){
                    break;
                }
            }
            if(event_now != null && ! event_now.isFinish()){
                event_now.update();
                break;
            }
        }
        return true;
    };

    /**
     * Event index pointer advance
     * @returns {boolean}
     */
    function poaAdd(){
        _sf.pos += 1;
        if(_sf.pos >= _sf.event_list.length){
            _sf.isEnd = true;
            _sf.event_list = [];
            event_now = null;
            return false;
        }
        if(makerEvent(_sf.event_list[_sf.pos])){
            return true;
        }
    }

    /**
     * Data translation
     * @param e |event data
     * @returns {boolean}
     */
    function makerEvent(e){
        var ee = new IList();
        event_now = ee.MakeEvent(e,_sf);
        return event_now == null ? false : event_now.init();
    }

    /**
     * Jump to the specified event location
     * @param index
     */
    this.jumpToIndex = function(index){
        _sf.pos = index - 1;
        if(_sf.pos >= _sf.event_list.length){
            _sf.isEnd = true;
            event_now = null;
        }
    };
    /**
     * Conditional Branch
     * @param FIndex | event position at the end of the condition
     * @constructor
     */
    this.IFInfo = function(FIndex){
        this.FinishJumpIndex = FIndex;
    };
    /**
     * Loop
     * @param l | starting position of loop
     * @param b | end position of loop
     * @constructor
     */
    this.LoopInfo = function(l,b){
        this.LoopIndex = l;
        this.BreakIndex = b;
    };

    /**
     * Choices
     * @param Cindex | Choices position
     * @param FIndex | end position
     * @constructor
     */
    this.BranchInfo = function(Cindex,FIndex){
        this.ChoiceJumpIndex = Cindex;
        this.FinishJumpIndex = FIndex;

        this.GetJumpIndex = function(selectIndex){
            return this.ChoiceJumpIndex[selectIndex];
        }
    };
    /**
     * Choices popping
     * @returns {*}
     */
    this.AuxFetchBranchinfo = function(){
        var s = null;
        while (true) {
            if(_sf.indentStack.length <= 0) {s = null ;break;}
            s = _sf.indentStack[_sf.indentStack.length -1];
            _sf.indentStack.remove(_sf.indentStack.length - 1);
            if(s == null || s instanceof _sf.BranchInfo) break;
        }
        _sf.endLogic = s;
        return s;
    };
    /**
     * Loop popping
     * @returns {*}
     */
    this.AuxFetchLoopinfo = function(){
        var s = null;
        while (true) {
            if(_sf.indentStack.length <= 0) {s = null ;break;}
            s = _sf.indentStack[_sf.indentStack.length -1];
            _sf.indentStack.remove(_sf.indentStack.length - 1);
            if(s == null || s instanceof _sf.LoopInfo) break;
        }
        _sf.endLogic = s;
        return s;
    };
    /**
     * Conditional Branch popping
     * @returns {*}
     */
    this.AuxFetchIfinfo = function(){
        var s = null;
        while (true) {
            if(_sf.indentStack.length <= 0) {s = null ;break;}
            s = _sf.indentStack[_sf.indentStack.length -1];
            _sf.indentStack.remove(_sf.indentStack.length - 1);
            if(s == null || s instanceof _sf.IFInfo) break;
        }
        _sf.endLogic = s;
        return s;
    }


}/**
 * Created by Yitian Chen on 2019/3/17.
 */
IM.Talk = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        var name = "";
        var id = parseInt(event.args[0]);
        if(event.args[0] == "-20"){
            id =  main.NowEventId;
        }
        if(event.args[1] == "1"){
            if(event.args[0] == "-10"){
                name = RV.GameData.actor.name;
            }else{
                var et = RV.NowMap.findEvent(id);
                if(et != null){
                    name = et.name;
                }
            }
        }else{
            name = event.args[2];
        }
        RV.NowCanvas.pop.talk(name , event.args[3],id);

        return false;
    };

    this.isFinish = function(){
        if(RV.NowCanvas.pop.isNext){
            RV.NowCanvas.pop.none();
            return true;
        }else if(!RV.NowCanvas.pop.isShowing() && RF.IsNext() ){
            RV.NowCanvas.pop.none();
            return true;
        }
        return false;
    };
};


IM.Message = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        var x = 0;
        var y = 0;
        RV.NowCanvas.message.setThis(event.args[1] == "1" , parseInt(event.args[0]));
        RV.NowCanvas.message.talk(event.args[2],event.args[3]);
        return false;
    };

    this.isFinish = function(){
        if(RV.NowCanvas.message.isNext){
            RV.NowCanvas.message.re();
            return true;
        }else if(!RV.NowCanvas.message.isShowing() && RF.IsNext() ){
            RV.NowCanvas.message.re();
            return true;
        }
        return false;
    };
};

IM.TextChoice = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        RV.NowCanvas.choice.setupChoice(event.args , 1000);
        return false;
    };

    this.finish = function(){
        var index = RV.NowCanvas.choice.index;
        main.insertEvent(event.events[index].events);
    };

    this.isFinish = function(){
        return !RV.NowCanvas.choice.isW;
    };
};

IM.Tips = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        RF.ShowTips(event.args[0]);
        return false;
    };
};

IM.MessageBox = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var index = -1;

    this.init = function(){
        if(IVal.scene instanceof  SMain){
            var msg = RF.MakerValueText(event.args[0]);
            IVal.scene.setDialog(new WMessageBox(msg,event.args[1],event.args[2]),function(e){
                index = e === 1 ? 0 : 1;
            });
        }
        return false;
    };

    this.finish = function(){
        if(event.events.length - 1 >= index){
            main.insertEvent(event.events[index].events);
        }

    };

    this.isFinish = function(){
        return index >= 0;
    };
};

IM.CloseTalk = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        RV.NowCanvas.pop.none();
        return false;
    };
};

IM.CloseMessage = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        RV.NowCanvas.message.re();
        return false;
    };
};/**
 * Created by Yitian Chen on 2019/3/18.
 */
IM.Wait = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = 0;

    this.init = function(){
        wait = parseInt(event.args[0]);
        if(wait >= 30){
            RV.NowCanvas.message.re();
        }
        return false;
    };

    this.update = function(){
        wait -= 1
    };

    this.isFinish = function(){
        return wait <= 0
    };

};


IM.Value = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var index1 = parseInt(event.args[0]);
        var val = RV.GameData.value[index1];
        var val2 = null;
        if(val != null){
            if(val === true || val === false){
                if(event.args[1] == "0"){
                    RV.GameData.value[index1] = event.args[2] == "1";
                }else if(event.args[1] == "1"){
                    val2 = RV.GameData.value[parseInt(event.args[2])];
                    if(val2 != null){
                        RV.GameData.value[index1] = val2;
                    }
                }else if(event.args[1] == "2"){
                    val2 = RV.GameData.value[parseInt(event.args[2])];
                    if(val2 != null){
                        RV.GameData.value[index1] = !val2;
                    }
                }
            }else if(!isNaN(val)){
                if(event.args[2] == "0"){
                    val2 = parseInt(event.args[3]);
                }else if(event.args[2] == "1"){
                    val2 = RV.GameData.value[parseInt(event.args[3])];
                }else if(event.args[2] == "2"){
                    val2 = rand(parseInt(event.args[3]),parseInt(event.args[4]))
                }else if(event.args[2] == "3"){
                    val2 = makeGameDataText(parseInt(event.args[3]),parseInt(event.args[4]),parseInt(event.args[5]));
                }
                RV.GameData.value[index1] = Calculation(parseInt(event.args[1]),RV.GameData.value[index1],val2);
            }else if(typeof(val)=='string'){
                RV.GameData.value[index1] = event.args[1];
            }
        }
        return false;
    };

    function makeGameDataText(type, s1, s2) {
        var val = 0;
        if (type == 0) {
            var bag = RV.GameData.findItem(0,s1);
            if(bag != null){
                return bag.num;
            }
        } else if (type == 1) {
            bag = RV.GameData.findItem(1,s1);
            if(bag != null){
                return bag.num;
            }
        } else if (type == 2) {
            bag = RV.GameData.findItem(2,s1);
            if(bag != null){
                return bag.num;
            }
        } else if (type == 3) {
            if(s1 == 0){
                return RV.GameData.actor.getMaxHP();
            }else if(s1 == 1){
                return RV.GameData.actor.getMaxMp();
            }else if(s1 == 2){
                return RV.GameData.actor.hp;
            }else if(s1 == 3){
                return RV.GameData.actor.mp;
            }else if(s1 == 4){
                return RV.GameData.actor.getWAtk();
            }else if(s1 == 5){
                return RV.GameData.actor.getWDef();
            }else if(s1 == 6){
                return RV.GameData.actor.getMAtk();
            }else if(s1 == 7){
                return RV.GameData.actor.getMDef();
            }else if(s1 == 8){
                return RV.GameData.actor.getSpeed();
            }else if(s1 == 9){
                return RV.GameData.actor.getLuck();
            }else if(s1 == 10){
                return RV.GameData.actor.level;
            }
        } else if (type == 4) {
            var rect = null;
            var et = null ;
            if (s1 == -10) {
                et = RV.NowMap.getActor();
                rect = RV.NowMap.getActor().getCharacter().getCharactersRect();
            } else if (s1 == -20) {
                et = RV.NowMap.findEvent(main.NowEventId);
                if(et != null){
                    rect = et.getRect();
                }

            } else {
                et = RV.NowMap.findEvent(s1);
                if(et != null){
                    rect = et.getRect();
                }
            }
            if (s2 == 0) {
                if(rect != null){
                    return parseInt(rect.centerX / RV.NowProject.blockSize);
                }

            } else if (s2 == 1) {
                if(rect != null){
                    return parseInt((rect.bottom - RV.NowProject.blockSize) / RV.NowProject.blockSize);
                }
            } else if (s2 == 2) {
                if(et != null){
                    return et.getDir();
                }
            }
        } else if (type == 5) {
            if (s1 == 0) {
                return RV.NowMap.getData().id;
            } else if (s1 == 1) {
                return RV.GameData.money;
            } else if (s1 == 2) {
                return IInput.x;
            } else if (s1 == 3) {
                return IInput.y;
            }
        }else if(type == 6){
            rect = null;
            et = RV.NowMap.findEnemy(s1);
            if(et != null){
                rect = et.getRect();
            }
            if (s2 == 0) {
                if(rect != null){
                    return parseInt(rect.centerX / RV.NowProject.blockSize);
                }

            } else if (s2 == 1) {
                if(rect != null){
                    return parseInt((rect.bottom - RV.NowProject.blockSize) / RV.NowProject.blockSize);
                }
            } else if (s2 == 2) {
                if(et != null){
                    return et.getDir();
                }
            }
        }
        return val;
    }


    function Calculation(fuc,val1,val2){
        if(fuc == 0) return val2;
        if(fuc == 1) return val1 + val2;
        if(fuc == 2) return val1 - val2;
        if(fuc == 3) return val1 * val2;
        if(fuc == 4) return parseInt(val1 / val2);
        if(fuc == 5) return val1 % val2;
    }

};


IM.IF = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    var id =  main.NowEventId;
    var et = RV.NowMap.findEvent(id);

    this.init = function(){
        var dif = event2DIF();

        if(dif.result()){
            main.insertEvent(event.events[0].events);
        }else if(dif.haveElse){
            main.insertEvent(event.events[1].events);
        }
        return false;
    };

    function event2DIF(){
        var evt = event;
        if (evt.code != 203) return null;
        var dif = new DIf();
        dif.tag = et;
        dif.type = parseInt(evt.args[0]);
        dif.haveElse = evt.args[1] == "1";
        for (var i = 2; i < evt.args.length; i++) {
            var main = evt.args[i].split('Φ');
            var difi = new DIfItem();
            difi.type = parseInt(main[0]);
            difi.num1Index = parseInt(main[1]);
            difi.fuc = parseInt(main[2]);
            difi.type2 = parseInt(main[3]);
            difi.num2 = main[4];
            difi.num2Index =parseInt(main[5]);
            dif.items.push(difi);
        }
        return dif;
    }

};


IM.Loop = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        var newEvents = [];
        for(var i = 0;i<event.events.length;i++){
            newEvents.push(event.events[i]);
        }
        var et = new DEvent();
        et.code = 2041;
        newEvents.push(et);
        main.insertEvent(newEvents);
        return false;
    };

};

IM.LoopUp = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        for(var i = main.pos;i >= 0;i--){
            if(main.event_list[i].code == 204){
                main.pos = i;
                break;
            }else{
                main.event_list.splice(i,1);
            }
        }
        main.pos -= 1;
        return false;
    };

};

IM.LoopBreak = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var index = -1;
        for(var i = main.pos;i < main.event_list.length;i++){
            if(main.event_list[i].code == 2041){
                index = i;
                break;
            }
        }
        for(i = index ;i >= 0;i--){
            if(main.event_list[i].code == 204){
                main.pos = i;
                break;
            }else{
                main.event_list.splice(i,1);
            }
        }
        return false;
    };

};

IM.Event = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var trigger = RV.NowSet.findEventId(parseInt(event.args[0]));
        main.insertEvent(trigger.events);

    }
};

IM.MapMove = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = false;

    this.init = function(){
        var mapId = 0;
        var x = 0;
        var y = 0;
        var dir = -1;

        if(event.args[0] == "0"){
            mapId = parseInt(event.args[1]);
            x = parseInt(event.args[2]);
            y = parseInt(event.args[3]);
        }else if(event.args[0] == "1"){
            mapId =  RV.GameData.getValue(parseInt(event.args[1]),0);
            x = RV.GameData.getValue(parseInt(event.args[2]),0);
            y = RV.GameData.getValue(parseInt(event.args[3]),0);
        }
        if(event.args[4] == "1") dir = 1;
        if(event.args[4] == "2") dir = 0;

        RV.NowMap.moveMap(mapId , x , y , dir , function(){
            wait = true;
        });

    };

    this.isFinish = function(){
        return wait;
    };

};


IM.TriggerMove = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var et = null;
        if(event.args[4] == "-20"){
            et = RV.NowMap.findEvent(main.NowEventId);
        }else{
            et = RV.NowMap.findEvent(parseInt(event.args[4]));
        }
        if(et != null){
            if(et instanceof LInteractionBlock){
                if(event.args[0] === "0"){
                    et.x = parseInt(event.args[1]) * RV.NowProject.blockSize;
                    et.y = parseInt(event.args[2]) * RV.NowProject.blockSize;

                }else{
                    et.x = RV.GameData.getValue(parseInt(event.args[1])) * RV.NowProject.blockSize;
                    et.y = RV.GameData.getValue(parseInt(event.args[2])) * RV.NowProject.blockSize;
                }
            }else{

                var actor = et.getCharacter();
                if(actor != null){
                    if(event.args[0] === "0"){
                        et.getCharacter().getCharacter().x = parseInt(event.args[1]) * RV.NowProject.blockSize;
                        et.getCharacter().getCharacter().y = parseInt(event.args[2]) * RV.NowProject.blockSize;

                    }else{
                        et.getCharacter().getCharacter().x = RV.GameData.getValue(parseInt(event.args[1])) * RV.NowProject.blockSize;
                        et.getCharacter().getCharacter().y = RV.GameData.getValue(parseInt(event.args[2])) * RV.NowProject.blockSize;
                    }
                    et.getCharacter().Speed = [0,0];
                    et.getCharacter().getCharacter().setLeftRight(event.args[3] == "1");
                    et.updateIconPoint();
                }else{
                    var rect = et.getUserRect();
                    if(event.args[0] === "0"){
                        rect.x = parseInt(event.args[1]) * RV.NowProject.blockSize;
                        rect.y = parseInt(event.args[2]) * RV.NowProject.blockSize;

                    }else{
                        rect.x = RV.GameData.getValue(parseInt(event.args[1])) * RV.NowProject.blockSize;
                        rect.y = RV.GameData.getValue(parseInt(event.args[2])) * RV.NowProject.blockSize;
                    }
                    et.updateIconPoint();
                }
            }

        }
    }
};

IM.SelfSwitch = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;


    this.init = function(){
        var id =  main.NowEventId;
        var et = RV.NowMap.findEvent(id);
        if(et != null){
            et.setSwitch(parseInt(event.args[0]),event.args[1] == "1");
        }
        return false;
    };
};

IM.GameOver = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowMap.getActor().deathDo();
        return true;
    }
};

IM.GameWin = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RF.GameWin();
        return true;
    }

};/**
 * Created by Yitian Chen on 2019/3/19.
 */
IM.Flash = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var color = new IColor(parseInt(event.args[2]),parseInt(event.args[3]),parseInt(event.args[4]),parseInt(event.args[1]));
        RV.NowCanvas.flash(color,parseInt(event.args[0]));
        return false;
    };

};


IM.Shack = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowMap.startShack(parseInt(event.args[1]) , parseInt(event.args[2]) , parseInt(event.args[0]));
        return false;
    };

};

IM.MaskIn = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var color = new IColor(parseInt(event.args[2]),parseInt(event.args[3]),parseInt(event.args[4]),parseInt(event.args[1]));
        RV.NowCanvas.maskFadeIn(color,parseInt(event.args[0]));
        return false;
    }

};

IM.MakeOut = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.maskFadeOut(parseInt(event.args[0]));
        return false;
    }
};

IM.Weather = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowCanvas.weather.setWeatherType(parseInt(event.args[0]));
        return false;
    }
};

IM.PicShow = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var id = parseInt(event.args[0]) - 1;
        if(RV.NowCanvas.pics[id] != null){
            RV.NowCanvas.pics[id].dispose();
            RV.NowCanvas.pics[id] = null;
        }
        var path = "";
        if(event.args[1] == "0"){
            path = event.args[2];
        }else if(event.args[1] == "1"){
            path = RV.GameData.getValues(parseInt(event.args[2]));
        }
        var point = 0;
        if(event.args[3] == "1"){
            point = 0.5;
        }
        var x = 0;
        var y = 0;
        if(event.args[4] == "0"){
            x = parseInt(event.args[5]);
            y = parseInt(event.args[6]);
        }else{
            x = RV.GameData.getValueNum(parseInt(event.args[5]),0);
            y = RV.GameData.getValueNum(parseInt(event.args[6]),0);
        }
        var sp = new ISprite(RF.LoadBitmap("Picture/" + path));
        sp.yx = point;
        sp.yy = point;
        sp.x = x;
        sp.y = y;
        sp.zoomX = parseInt(event.args[7]) / 100;
        sp.zoomY = parseInt(event.args[8]) / 100;
        sp.opacity = parseInt(event.args[9]) / 255;
        sp.angle = parseInt(event.args[10]);

        sp.mirror = event.args[11] == "1";

        sp.z = 6000 + id;
        RV.NowCanvas.pics[id] = sp;
        return false;
    };
};

IM.PicMove = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = 0;

    this.init = function(){
        var id = parseInt(event.args[0]) - 1;
        if(RV.NowCanvas.pics[id] != null){
            var w = parseInt(event.args[1]);
            if(event.args[2] == "1"){
                wait = w;
            }
        }
        var point = 0;
        if(event.args[3] == "1"){
            point = 0.5;
        }
        var x = 0;
        var y = 0;
        if(event.args[4] == "0"){
            x = parseInt(event.args[5]);
            y = parseInt(event.args[6]);
        }else{
            x = RV.GameData.getValueNum(parseInt(event.args[5]),0);
            y = RV.GameData.getValueNum(parseInt(event.args[6]),0);
        }
        var sp = RV.NowCanvas.pics[id];
        if(sp == null) return false;
        sp.yx = point;
        sp.yy = point;
        sp.slideTo(x,y,w);
        sp.scaleTo(parseInt(event.args[7]) / 100 , parseInt(event.args[8]) / 100,w);
        sp.fadeTo(parseInt(event.args[9]) / 255,w);
        sp.rotateTo(parseInt(event.args[10]),w);
        sp.mirror = event.args[11] == "1";

        return false;
    };

    this.update = function(){
        wait -= 1
    };

    this.isFinish = function(){
        return wait <= 0
    };
};

IM.PicDel = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var id = parseInt(event.args[0]) - 1;
        if(RV.NowCanvas.pics[id] != null){
            RV.NowCanvas.pics[id].dispose();
            delete RV.NowCanvas.pics[id];
        }
        return false;
    };
};

IM.ShowAnim = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        //trigger
        var rect = null;
        var et = null ;
        if(event.args[1] == "0"){
            if(event.args[2] == "-10"){
                et = RV.NowMap.getActor();
            }else if(event.args[2] == "-20"){
                et = RV.NowMap.findEvent(main.NowEventId);
                if(et.getCharacter() == null){
                    rect = et.getRect();
                    et = null;
                }
            }else{
                et = RV.NowMap.findEvent(parseInt(event.args[2]));
                if(et.getCharacter() == null){
                    rect = et.getRect();
                    et = null;
                }
            }
        }else {
            et = RV.NowMap.findEnemy(parseInt(event.args[2]));
        }

        if(et != null || rect != null){
            RV.NowCanvas.playAnim(parseInt(event.args[3]),null,et,event.args[4] == "0",rect,event.args[0]);
        }


        return false;
    };
};

IM.StopAnim = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var am = RV.NowCanvas.findAnim(event.args[0]);
        if(am != null){
            am.dispose();
            RV.NowCanvas.anim.remove(am);
        }
    }

};



IM.ViewMove = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowMap.viewMove = false;
        RV.NowMap.getActor().isLook = false;
        var view = RV.NowMap.getView();
        var x = parseInt(event.args[0]) * -1;
        var y = parseInt(event.args[1]) * -1;
        view.shifting(view.ox,view.oy,view.ox + x , view.oy + y,parseInt(event.args[2]));
        return false;
    };
};

IM.ViewReset = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowMap.getActor().isLook = !RV.NowMap.getData().autoMove;
        RV.NowMap.viewMove = RV.NowMap.getData().autoMove;
        return false;
    };


};
/**
 * Created by Yitian Chen on 2019/3/19.
 */
IM.EventAction = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = 0;
    var actor = null;

    this.init = function(){
        var index = parseInt(event.args[0]);

        if(index == -10){//Actor
            actor = RV.NowMap.getActor();
        }else if(index == -20){//This trigger
            var temp = RV.NowMap.findEvent(main.NowEventId);
            if(temp instanceof LTrigger){
                actor = temp.getCharacter();
            }else if(temp instanceof LInteractionBlock){
                actor = temp;
            }
        }else{
            temp = RV.NowMap.findEvent(index);
            if(temp instanceof LTrigger){
                actor = temp.getCharacter();
            }else if(temp instanceof LInteractionBlock){
                actor = temp;
            }
        }
        if(actor != null){
            actor.setAction(event.events,event.args[1] == "1",event.args[2] == "1");
        }
        return false;
    };


    this.isFinish = function(){
        if(event.args[3] == "1"){
            if(actor == null){
                return true;
            }else{
                return !actor.actionStart;
            }
        }else{
            return true;
        }

    };

};


IM.BlockAction = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    var wait = 0;
    var block = null;

    this.init = function(){
        var tags = event.args[0].split(",");
        var mark = tags[1] + "," + tags[2];
        block = RV.NowMap.findBlock(mark);
        if(block != null){
            block.setAction(event.events,event.args[1] == "1",event.args[2] == "1");
        }
        return false;
    };


    this.isFinish = function(){
        if(event.args[3] == "1"){
            if(block == null){
                return true;
            }else{
                return !block.actionStart;
            }
        }else{
            return true;
        }

    };
};

IM.AddActorValue = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var value = parseInt(event.args[1]);
        if(event.args[0] == "0"){//LV
            RV.GameData.actor.levelUp(value);
        }else if(event.args[0] == "1"){//Exp
            RV.GameData.actor.exp += value;
        }else if(event.args[0] == "2"){//MAXHP
            RV.GameData.actor.addPow.maxHp += value;
        }else if(event.args[0] == "3"){//MAXMP
            RV.GameData.actor.addPow.maxMp += value;
        }else if(event.args[0] == "4"){//Attack
            RV.GameData.actor.addPow.watk += value;
        }else if(event.args[0] == "5"){//Defense
            RV.GameData.actor.addPow.wdef += value;
        }else if(event.args[0] == "6"){//M.Attack
            RV.GameData.actor.addPow.matk += value;
        }else if(event.args[0] == "7"){//M.Defense
            RV.GameData.actor.addPow.mdef += value;
        }else if(event.args[0] == "8"){//Speed
            RV.GameData.actor.addPow.speed += value;
        }else if(event.args[0] == "9"){//Luck
            RV.GameData.actor.addPow.luck += value;
        }
        return false;
    };
};

IM.ChangeHPMP = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var value = parseInt(event.args[3]);
        if(event.args[0] == "0"){//enemy
            var enemy = RV.NowMap.findEnemy(parseInt(event.args[1]));
            if(enemy != null){
                if(event.args[2] == "0"){
                    enemy.getActor().injure(0,-value);
                }else if(event.args[2] == "1"){
                    enemy.mp += value;
                }
            }
        }else{
            if(event.args[2] == "0"){
                RV.GameData.actor.hp += value;
            }else if(event.args[2] == "1"){
                RV.GameData.actor.mp += value;
            }
        }
        return false;
    };
};

IM.ChangeSkill = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        if(event.args[0] == "0"){//learn
            RV.GameData.actor.studySkill(parseInt(event.args[1]));
        }else {//Forget
            RV.GameData.actor.forgetSkill(parseInt(event.args[1]));
            for(var i = 0; i< RV.GameData.userSkill.length; i++){
                if(RV.GameData.actor.skill.indexOf(RV.GameData.userSkill[i]) == -1){
                    RV.GameData.userSkill[i] = 0;
                }
            }

        }
        return false;
    };
};

IM.ChangeBuff = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var value = parseInt(event.args[3]);
        if(RV.NowSet.findStateId(value) != null){
            var obj = null;
            if(event.args[0] == "0"){//enemy
                obj = RV.NowMap.findEnemy(parseInt(event.args[1]));
            }else{
                obj = RV.GameData.actor;
            }
            if(obj != null){
                if(event.args[2] == "0"){
                    obj.addBuff(value);
                }else{
                    if(IVal.scene instanceof SMain){
                        var buff = IVal.scene.getCtrl(5);
                        buff.disposeForData(obj.findBuff(value));
                    }
                    obj.subBuff(value);

                }
            }
        }

        return false;
    };
};

IM.ChangeActor = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var newActorData = RV.NowSet.findActorId( parseInt(event.args[0]));
        if(newActorData != null){

            RV.GameData.actor.changeData(newActorData,event.args[1] == "1");
            var res = RV.NowRes.findResActor(parseInt(newActorData.actorId));
            if(res != null){
                RV.NowMap.getActor().getCharacter().changeImage(res);
            }
        }
        return false;
    };
};

IM.ChangeJumpNum = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowMap.getActor().JumpTimes = parseInt(event.args[0]);
        RV.GameData.jumpTimes = parseInt(event.args[0]);
        return false;
    };
};

IM.ChangeEquip = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var item = new DBagItem();
        if(event.args[0] == "0"){
            item.type = 1;
        }else{
            item.type= 2;
        }
        item.id = parseInt(event.args[1]);
        item.num = 1;
        if(item.findData() != null){
            RV.GameData.actor.equipLoad(item);
            RV.GameData.actor.updateEquip();
        }
        return false;
    };
};

IM.ChangeJumpSpeed = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowMap.getActor().JumpNum = parseInt(event.args[0]);
        RV.GameData.jumpNum = parseInt(event.args[0]);
        return false;
    };
};

IM.ChangeGravity = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.NowMap.changeGravityNum(parseInt(event.args[0]));
        return false;
    };
};

IM.SetEnemy = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var enemy = RV.NowMap.findEnemy( parseInt(event.args[0]) );
        if(enemy != null){
            enemy.activity = event.args[1] === "1";
            enemy.visible = event.args[2] === "1";
        }
        return false;
    };
};

IM.BossBar = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var enemy = RV.NowMap.findEnemy( parseInt(event.args[0]) );
        if(enemy != null){
            if(IVal.scene instanceof SMain){
                IVal.scene.setBossBar(enemy)
            }
        }
        return false;
    };
};

IM.addEnemy = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var enemy = new DMapEnemy();
        enemy.index = RV.GameData.enemyIndex;
        enemy.eid = parseInt(event.args[3]);
       //older versions
        if(event.args[4] != null){
            enemy.dir = parseInt(event.args[4]);
        }
        if(event.args[0] == "0"){//Direct Designation
            enemy.x = parseInt(event.args[1]);
            enemy.y = parseInt(event.args[2]);
        }else{//Designation with Variables
            enemy.x = RV.GameData.getValue(parseInt(event.args[1]),0);
            enemy.y = RV.GameData.getValue(parseInt(event.args[2]),0);
        }
        RV.NowMap.drawEnemys(enemy);
        RV.GameData.enemyIndex += 1;
        return false;
    };
};/**
 * Created by Yitian Chen on 2019/3/19.
 */
IM.BGMPlay = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.playBGM("Audio/" + event.args[0],parseInt(event.args[1]));
        return false;
    };
};


IM.BGSPlay = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.playBGS("Audio/" + event.args[0],parseInt(event.args[1]));
        return false;
    };
};

IM.SEPlay = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.playSE("Audio/" + event.args[0],parseInt(event.args[1]));
        return false;
    };
};

IM.BGMFade = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.nowBGMFile = "";
        IAudio.BGMFade(parseInt(event.args[0]));
        return false;
    };
};

IM.BGSFade = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameSet.nowBGSFile = "";
        IAudio.BGSFade(parseInt(event.args[0]));
        return false;
    };
};

IM.SEStop = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        IAudio.stopSE();
        return false;
    };
};/**
 * Created by Yitian Chen on 2019/3/19.
 */

IM.Money = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameData.money += parseInt(event.args[0]);
        if(RV.GameData.money < 0){
            RV.GameData.money = 0;
        }
        return false;
    };
};


IM.AddItems = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.GameData.addItem(parseInt(event.args[0]) , parseInt(event.args[1]) , parseInt(event.args[2]));
        return false;
    };
};


IM.Shop = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var items = [];
        for(var i = 0;i<event.args.length;i++){
            var temp = event.args[i].split("|");
            var item = new DBagItem(parseInt(temp[0]),parseInt(temp[1]));
            if(item.findData() != null){
                items.push(item);
            }

        }
        if(IVal.scene instanceof SMain){
            IVal.scene.setDialog(new WShop(items),
                function(){
                    IVal.scene.setDialog(null,null);

                });
        }
        return false;
    };
};

IM.ShowMenu = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        var index = parseInt(event.args[0]);
        var shortcut = null;
        if(index === 0){//equipments
            if(IsPC()){
                shortcut = new WShortcut();
                shortcut.shortcutList(1)
            }
            if(IVal.scene instanceof SMain){
                IVal.scene.setDialog(new WEquipment(shortcut),
                    function(){
                        IVal.scene.setDialog(null,null);
                        if(shortcut != null) shortcut.dispose();
                    });

            }
        }else if(index === 1){//skills
            if(IsPC()){
                shortcut = new WShortcut();
                shortcut.shortcutList(2)
            }
            if(IVal.scene instanceof SMain){
                IVal.scene.setDialog(new WSkill(shortcut),
                    function(){
                        IVal.scene.setDialog(null,null);
                        if(shortcut != null) shortcut.dispose();
                    });

            }
        }else if(index === 2){//items
            if(IsPC()){
                shortcut = new WShortcut();
                shortcut.shortcutList(3)
            }
            if(IVal.scene instanceof SMain){
                IVal.scene.setDialog(new WInventory(shortcut),
                    function(){
                        IVal.scene.setDialog(null,null);
                        if(shortcut != null) shortcut.dispose();
                    });

            }
        }else if(index === 3){//option
            if(IsPC()){
                shortcut = new WShortcut();
                shortcut.shortcutList(4)
            }
            if(IVal.scene instanceof SMain){
                IVal.scene.setDialog(new WOption(),
                    function(){
                        IVal.scene.setDialog(null,null);
                        if(shortcut != null) shortcut.dispose();
                    });

            }
        }
        return false;
    };
};

IM.SaveGame = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RF.SaveGame();
        return false;
    };
};

IM.LoadGame = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        RV.isLoad = true;

        return false;
    };
};


IM.Script = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        eval(event.args[0]);
        return false;
    };
};

IM.mainUI = function(event,main){
    this.base = IEventBase;
    this.base();
    delete this.base;

    this.init = function(){
        //Hp bar
        RV.GameData.uiHp = event.args[0] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(2).setCtrlVisible(0,event.args[0] == "1");
        }
        //life
        RV.GameData.uiLife = event.args[1] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(2).setCtrlVisible(1,event.args[1] == "1");
        }
        //Mp bar
        RV.GameData.uiMp = event.args[2] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(2).setCtrlVisible(2,event.args[2] == "1");
        }
        //EXP & LV
        RV.GameData.uiExp = event.args[3] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(2).setCtrlVisible(3,event.args[3] == "1");
        }
        //gold
        RV.GameData.uiMoney = event.args[4] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(2).setCtrlVisible(4,event.args[4] == "1");
        }
        //Menu button
        RV.GameData.uiMenu = event.args[5] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(3).visible = event.args[5] == "1";
        }
        //Item Shortcuts
        RV.GameData.uiItems = event.args[6] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(1).setVisible(event.args[6] == "1")
        }
        //Skill Shortcuts
        RV.GameData.uiSkill = event.args[7] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(0).setSkillVisible(event.args[7] == "1")
        }
        //AssistiveTouch（Phone）
        RV.GameData.uiPhone = event.args[8] == "1";
        if(IVal.scene instanceof  SMain){
            IVal.scene.getCtrl(0).setPhoneVisible(event.args[8] == "1");
            var rock = IVal.scene.getCtrl(4);
            if(rock != null){
                rock.setVisible(event.args[8] == "1")
            }
        }

        return false;
    };
};

/**
 * Created by Yitian Chen on 2019/1/10.
 * Logic of Characters，derive LTrigger、LEnemy
 * @param view | viewport
 * @param maxX | max width of map
 * @param maxY | max height of map
 * @param data | blocks of map
 * @param block | Interactive Blocks of map
 * @param x | x of actor
 * @param y | y of actor
 * @param resId | actor resourceID
 * @param z  | layer z
 */
function LActor(view , maxX , maxY , data , block , x , y , resId,z){
    var _sf = this;
    //==================================== Public attributes ===================================
    //four direction speed 0-up 1-left
    this.Speed = [0,0];
    //Death callback
    this.DieDo = null;
    //injured callback
    this.InjuredDo = null;
    //Affected by gravity or not
    this.IsGravity = true;
    //Gravity Coefficient
    this.GravityNum = 0;
    //Jump Height
    this.JumpNum = 0;
    //Jump Frequency
    this.JumpTimes = 0;
    //Through or not
    this.IsCanPenetrate = false;
    //Camera focus on or not
    this.isLook = false;
    //camp
    this.camp = 0;
    //attack type
    this.atkType = 0;
    //Attack Range
    this.atkDis = 1;
    this.bulletId = 1;
    //invincible
    this.invincibleTime = 0;
    //super armor
    this.superArmor = false;
    //stagger time
    this.stiffTime = 0;
    //In combat
    this.combatTime = 0;
    //steps
    this.moveNum = 0;
    //casting skill or not
    this.skillChant = false;
    //External control-related variable movement
    this.actionStart = false;
    this.actionLock = false;
    this.reAction = false;
    //Attack frequency,default is 35(no equipments)
    this.atkWait = 35;
    //current skill
    this.nowSkill = null;
    //==================================== Private attributes ===================================
    var atkWaitNow = 0;
    //actor data in resource
    var resData = RV.NowRes.findResActor(resId);
    //Instantiate LCharacters，show in Screen

    if(resData == null) throw new Error('Wrong Character ID：'  + resId);
    var character = new LCharacters(resData,view,z,data,block);
    character.actor = this;
    character.CanPenetrate = this.IsCanPenetrate;
    //set character in x,y coordinates
    character.mustXY(x,y);

    //Jumping or not
    var isJump = false;
    //CD of jump
    var jumpWait = 0;
    var jumpTimes = 0;
    //squating or not
    var isSquat = false,isRSquat = false;
    //moving or not
    var isMove = false,  isRun = false;
    var isAtk = false;
    //Basic movement speed
    this.baseSpeed = 2;
    this.speedEfficiency = 1;
    //Basic frequency
    this.actionRate = 5;

    var nowRate = this.actionRate;
    var actionSpeed = this.baseSpeed;
    var moveWait = 0;
    var moveWaitUD = 0;
    var actionIgnore = false;
    var actionLoop = false;
    var actionMove = false;
    var actionJump = false;
    var actionJumpHeight = 0;
    var actionJumpHeightA = 0;
    var actionJumpHeightY = 0;
    var actionJumpHeightX = 0;
    var tempJumpX = 0;
    var actionList = [];
    var actionPos = -1;
    var nowAction = null;
    var actionWait = 0;
    var moveDir = -1;
    var moveDis = 0;

    var oldGravity = false;
    var oldLock = false;
    var oldSpeed = false;
    var oldRate = false;



    this.isDie = false;

    //==================================== Public Function ===================================

    /**
     * Main update
     */
    this.update = function(){

        character.actionRate = _sf.actionRate * _sf.speedEfficiency;
        character.updateBase();
        if(_sf.isDie) return;
        updateEnemyCollision();
        updateAction();
        actorMove();
        if(_sf.isLook) _sf.correctedViewport();
        death();
        updateBlock();
        if(isRun){
            actionSpeed = (_sf.baseSpeed  + 2) * _sf.speedEfficiency;
        }else{
            actionSpeed = (_sf.baseSpeed * _sf.speedEfficiency);
        }
        if(!_sf.actionStart && !_sf.reAction){
            isMove = false;
            isRun = false;
        }
        isRSquat = false;

        //character.resetPublicBlock();
        if(_sf.invincibleTime > 0){
            _sf.invincibleTime -= 1;
        }
        if(_sf.stiffTime > 0){
            _sf.stiffTime -= 1;
        }
        if(_sf.combatTime > 0){
            _sf.combatTime -= 1;
        }
        if(atkWaitNow > 0){
            atkWaitNow -= 1;
        }
    };

    /**
     * Dispose
     */
    this.dispose = function(){
        character.disposeBase();
    };

    this.setInitData = function(mx,my,m,b){
        maxX = mx;
        maxY = my;
        data = m;
        block = b;
        character.setInitData(m,b);
    };

    /**
     *  camera focuses on Actor
     */
    this.lookActor = function(){
        var rect = character.getCharactersRect();
        var point = [rect.centerX, rect.bottom - RV.NowProject.blockSize];
        var ox = -1 * (point[0] - (view.width / 2));
        var oy = -1 * (point[1] - (view.height / 2));
        var leftMax = 0;
        var rightMax = maxX;
        var topMax = 0;
        var bottomMax = maxY;
        if(ox > leftMax) ox = leftMax;
        if(ox < -(rightMax - view.width)) ox = -(rightMax - view.width);
        if(oy > topMax) oy = topMax;
        if(oy < -(bottomMax - view.height)) oy = -(bottomMax - view.height);
        view.ox = ox;
        view.oy = oy;
    };

    /**
     * camera correction
     */
    this.correctedViewport = function(){
        //The principle of people in the center
        var point = [character.x,character.y];

        var ox = view.ox;
        var oy = view.oy;


        var leftMax = 0;
        var rightMax = maxX * view.zoomX;
        var topMax = 0;
        var bottomMax = maxY * view.zoomY;
        if(RV.NowMap.viewMove){
            var speed = (RV.NowMap.viewSpeed + 1) / 10;
            var tempX = -1 * (point[0] - (view.width / 2));
            var tempY = -1 * (point[1] - (view.height / 2));
            if(RV.NowMap.viewDir == 0){//up
                oy += speed;
                oy = Math.max(oy,tempY);
                ox = tempX;
            }else if(RV.NowMap.viewDir == 1){//down
                oy -= speed;
                oy = Math.min(oy,tempY);
                ox = tempX;
            }else if(RV.NowMap.viewDir == 2){//left
                ox += speed;
                ox = Math.max(ox,tempX);
                oy = tempY;
            }else if(RV.NowMap.viewDir == 3){//right
                ox -= speed;
                ox = Math.min(ox,tempX);
                oy = tempY;
                //leftMax = ox;
            }
        }else{
            ox = -1 * (point[0] - ((view.width / view.zoomX) / 2));
            oy = -1 * (point[1] - ((view.height / view.zoomY) / 2));
        }

        if(ox > leftMax) ox = leftMax;
        if(ox < -(rightMax - view.width)) ox = -(rightMax - view.width);

        if(oy > topMax) oy = topMax;
        if(oy < -(bottomMax - view.height)) oy = -(bottomMax - view.height);

        view.ox = ox;
        view.oy = oy;
    };

    /**
     * Jump
     * @returns {boolean} Whether the jump is successful
     */
    this.jump = function(){
        if(actionJump || _sf.stiffTime > 0) return;
        if(isCanJump()){
            if(isSquat && character.BlockBelow == 4){
                character.y += RV.NowProject.blockSize;
                return true;
            }else if(!isSquat){
                if(character.IsInSand){
                    _sf.Speed[0] = -_sf.JumpNum / 2;
                }else{
                    _sf.Speed[0] = -_sf.JumpNum;
                }
                isJump = true;
                jumpTimes += 1;
                jumpWait = 5;
                var sound = RV.NowSet.setAll.jumpSound;
                RV.GameSet.playSE("Audio/" + sound.file,sound.volume);
                return true;
            }

        }
        return false;
    };

    /**
     * Squat
     * @returns {boolean} Whether the squat is successful
     */
    this.squat = function(){
        if(actionJump || _sf.stiffTime > 0) return false;
        if(!isJump && _sf.Speed[0] == 0){
            isSquat = true;
            isRSquat = true;
            return true;
        }
        return false;
    };

    /**
     * Move up
     */
    this.moveUp = function(){
        if(actionJump || _sf.stiffTime > 0) return;
        var max = actionSpeed;
        if(character.IsInSand){
            max = max * (character.SandNum / 1);
        }
        character.y -= max;
        isMove = true;
    };

    this.moveDown = function(){
        if(actionJump || _sf.stiffTime > 0) return;
        var max = actionSpeed;
        if(character.IsInSand){
            max = max * (character.SandNum / 1);
        }
        character.y += max;
        isMove = true;
    };

    /**
     * Move left
     */
    this.moveLeft = function(){
        if(actionJump || _sf.stiffTime > 0) return;
        if(_sf.atking() && _sf.atkType == 0) return;
        character.setLeftRight(true);
        var max = actionSpeed;
        if(character.IsInSand){
            max = character.SandNum;
        }
        if(isSquat){
            if(_sf.Speed[1] == 0){
                _sf.Speed[1] = -0.15;
            }
        }else{
            _sf.Speed[1] += - max / 4;
        }
        if(character.BlockBelow == 1){
            if(_sf.Speed[1] <= -max * 1.5){
                _sf.Speed[1] = -max * 1.5;
            }
        }else{
            if(_sf.Speed[1] <= -max){
                _sf.Speed[1] = -max;
            }
        }
        isMove = true;
    };



    /**
     * Move right
     */
    this.moveRight = function(){
        if(actionJump || _sf.stiffTime > 0) return;
        if(_sf.atking() && _sf.atkType == 0) return;
        character.setLeftRight(false);
        var max = actionSpeed;
        if(character.IsInSand){
            max = character.SandNum;
        }
        if(isSquat){
            if(_sf.Speed[1] == 0){
                _sf.Speed[1] = 0.15;
            }
        }else{
            _sf.Speed[1] += max / 4;
        }
        if(character.BlockBelow == 1){
            if(_sf.Speed[1] >= max * 1.5){
                _sf.Speed[1] = max * 1.5;
            }
        }else{
            if(_sf.Speed[1] >= max){
                _sf.Speed[1] = max;
            }
        }
        isMove = true;
    };
    /**
     * Attack
     * @param obj
     */
    this.atk = function(obj){
        if(actionJump || _sf.stiffTime > 0 || atkWaitNow > 0 || _sf.nowSkill != null) return;
        atkWaitNow = _sf.atkWait / _sf.speedEfficiency;
        isAtk = true;
        if(_sf.atkType == 1 && character.shootCall == null){
            character.shootCall = function(points){
                for(var i = 0;i<points.length;i++){
                    var p = character.getCenterPoint();
                    var x = p[0] + points[i].x;
                    if(_sf.getDir() == 1){
                        x = p[0] - points[i].x;
                    }
                    var y = p[1] + points[i].y;
                    RV.NowCanvas.playBullet(_sf.bulletId , _sf , x , y,obj);
                }
                character.shootCall = null;
            };
        }
        if(_sf.atkType == 0){
            character.atkCall = function(){
                var atkRect = _sf.getAtkRect();
                if(_sf.camp == 0){//actor attack
                    //decision of Interactive block
                    var blocks = character.getInteractionBlocks();
                    if(blocks != null){
                        for(var i = 0;i<blocks.length;i++){
                            if(blocks[i].isDestroy == false && blocks[i].getData().isDestroy == true && blocks[i].isCollision(atkRect)){
                                blocks[i].destroy();
                            }
                        }
                    }
                    //enemy decision
                    var arms = RV.GameData.actor.equips.arms;
                    var armsData = RV.NowSet.findArmsId(arms);
                    var armsAnimId = 0;
                    if(armsData != null){
                        armsAnimId = armsData.atkAnimId;
                    }

                    var enemy = RV.NowMap.getEnemys();
                    for(i = 0;i<enemy.length;i++){
                        if(enemy[i].getActor().camp == 1 && enemy[i].visible && enemy[i].getRect().intersects(atkRect) && !enemy[i].isDie){
                            _sf.combatTime = 120;
                            enemy[i].getActor().combatTime = 300;
                            enemy[i].getActor().injure(2, RF.ActorAtkEnemy(enemy[i],_sf.getDir() ) );
                            RV.NowCanvas.playAnim(armsAnimId,null,enemy[i].getActor(),true);
                        }
                    }
                }else if(_sf.camp == 1){//enemy
                    //actor decision
                    if(RV.NowMap.getActor().getCharacter().getCharactersRect().intersects(atkRect)){
                        _sf.combatTime = 300;
                        RV.NowMap.getActor().combatTime = 300;
                        RV.NowMap.getActor().injure(3,obj)
                    }
                    //Ally decision
                    enemy = RV.NowMap.getEnemys();
                    for(i = 0;i<enemy.length;i++){
                        if(enemy[i].getActor().camp == 2 && enemy[i].visible && enemy[i].getRect().intersects(atkRect) && !enemy[i].isDie){
                            enemy[i].getActor().combatTime = 300;
                            enemy[i].getActor().injure(2, RF.EnemyAtkEnemy(obj,enemy[i] ) );
                        }
                    }

                }else if(_sf.camp == 2){//Ally
                    enemy = RV.NowMap.getEnemys();
                    for(i = 0;i<enemy.length;i++){
                        if(enemy[i].getActor().camp == 1 && enemy[i].visible && enemy[i].getRect().intersects(atkRect) && !enemy[i].isDie){
                            enemy[i].getActor().combatTime = 300;
                            enemy[i].getActor().injure(2, RF.EnemyAtkEnemy(obj,enemy[i] ) );
                        }
                    }
                }
                character.atkCall = null;
            }
        }


    };
    /**
     * get Attack decision area
     * @returns {IRect}
     */
    this.getAtkRect = function(){
        var rect = character.getCharactersRect();
        var atkRect = null;
        if(_sf.getDir() == 1){
            atkRect = new IRect(rect.left - _sf.atkDis * RV.NowProject.blockSize,rect.top,rect.right,rect.bottom);
        }else{
            atkRect = new IRect(rect.left,rect.top,rect.right + _sf.atkDis * RV.NowProject.blockSize,rect.bottom);
        }
        return atkRect;
    };
    /**
     * Auto move right
     */
    this.autoRight = function(){
        if(actionJump || _sf.stiffTime > 0) return;
        character.setLeftRight(false);
        if(character.getSpirte().x - character.getSpirte().width > data.length * RV.NowProject.blockSize){
            return;
        }
        var max = actionSpeed / 4;
        if(character.IsInSand){
            max = max * (character.SandNum / 4);
        }
        character.x += max;
    };
    /**
     * Speed up
     */
    this.speedUp = function(){
        if(actionJump || actionMove || _sf.stiffTime > 0) return;
        isRun = true;
    };
    /**
     * get decision area of actor
     * @returns {IRect}
     */
    this.getUserRect = function(){
        return character.getCharactersRect();
    };
    /**
     * get display area of actor
     * @returns {*|IRect}
     */
    this.getShowRect = function(){
        return character.getSpirte().GetRect();
    };
    /**
     * get x & y of actor
     * @returns {{x, y}}
     */
    this.getXY = function(){
        return {
            x : character.x,
            y : character.y
        }
    };
    /**
     * get character of actor
     * @returns {LCharacters}
     */
    this.getCharacter = function(){
        return character;
    };
    /**
     * get direction of actor
     * @returns {number}
     */
    this.getDir = function(){
        return character.getSpirte().mirror ? 1 : 0;
    };
    /**
     * attacking or not
     * @returns {boolean}
     */
    this.atking = function(){
        return character.getActionIndex() == 6 || character.getActionIndex() == 7 || character.getActionIndex() == 8 || character.getActionIndex() == 11;
    };
    /**
     * set actions of actor
     * @param action | action list
     * @param isIgnore | Ignore actions that cannot be execute or not
     * @param isLoop | loop or not
     */
    this.setAction = function(action,isIgnore,isLoop){
        if(this.actionStart) return;
        actionLoop = isLoop;
        actionIgnore = isIgnore;
        for(var i = 0;i<action.length;i++){
            actionList.push(action[i]);
        }
        if(actionList.length > 0){
            this.actionStart = true;
        }
        oldRate = character.actionRate;
        oldSpeed = _sf.baseSpeed;
        oldLock = _sf.actionLock;
        oldGravity = _sf.IsGravity;
    };

    /**
     * stop action
     */
    this.stopAction = function(){
        if(!this.actionStart) return;
        _sf.IsGravity = oldGravity;
        _sf.baseSpeed = oldSpeed;
        character.actionRate = oldRate;
        actionWait = 0;
        actionJump = false;
        actionMove = false;
        actionPos = -1;
        actionList = [];
        _sf.actionStart = false;
    };

    /**
     * be injured
     * @param type
     * @param num
     */
    this.injure = function(type,num){
        if(((typeof (num) == "object"|| num > 0) && _sf.invincibleTime > 0) || _sf.isDie) return;
        if(_sf.InjuredDo != null){
            _sf.InjuredDo(type,num);
        }

    };
    /**
     * Stagger and Hit Recover
     * @param time | duration
     */
    this.stiff = function(time){
        if(!_sf.superArmor){
            _sf.stiffTime = time;//Stagger
            _sf.skillChant = false;
            character.getSpirte().flash(new IColor(255,0,0,255),20);
            if(character.haveActionIndex(9) && !_sf.actionLock){
                character.setAction(9,false,true,true);
            }
        }else{
            character.getSpirte().flash(new IColor(255,255,100,255),20);
        }

    };
    /**
     * invincible start
     * @param time | duration
     */
    this.invincible = function(time) {
        _sf.invincibleTime = time;
        addinjureAction(_sf.invincibleTime);
    };
    /**
     * invincible end
     */
    this.endIncible = function(){
        _sf.invincibleTime = 0;
        character.getSpirte().stopAnim();
    };

    /**
     * Death
     */
    this.deathDo = function(){
        _sf.isDie = true;
        if(_sf.nowSkill != null){
            _sf.superArmor = false;
            _sf.nowSkill.stopSkill();
            _sf.nowSkill.update();
            _sf.nowSkill = null;
        }
        character.getSpirte().pauseAnim();
        character.getSpirte().stopAnim();
        if(character.haveActionIndex(10)){
            character.actionCall = null;
            character.setAction(10,false,true,false,true);
            character.actionCall = function(){
                var sp = character.getSpirte();
                sp.fadeTo(0,40);
                character.actionCall = null;
            };
        }else{
            character.getSpirte().visible = false;
        }
        if(_sf.DieDo != null){
            _sf.DieDo();
        }
    };

    //==================================== Private Function ===================================

    /**
     * actor move
     */
    function actorMove(){
        speedRecovery();
        //Action correction
        if(!_sf.actionLock && !_sf.skillChant){
            if(isSquat && !isRSquat && !isJump){
                var size = character.getValidSize(0);
                var rect = character.getCharactersRect(character.x,character.y,size[0],size[1]);
                if(Math.abs(character.isCanMoveUpDown(rect.left,rect.right,rect.top,true,rect)) <= 2){
                    isSquat = false;
                    character.resetValidSize();
                }
            }
            if(isAtk){
                if(isSquat){
                    character.setAction(8,false,true,true);
                }else if(isJump && Math.abs( _sf.Speed[0]) >= _sf.GravityNum + 0.1){
                    character.setAction(7,false,true,true);
                }else if(isMove){
                    character.setAction(11,false,true,true);
                }else{
                    character.setAction(6,false,true,true);
                }
                isAtk = false;
            }else if(isSquat){//Squating
                waitJump();
                if(jumpWait == 0){
                    jumpTimes = 0;
                }
                isJump = false;
                character.setAction(5,true);
            }else if(isJump && _sf.Speed[0] < 0){//Jumping
                character.setAction(1,false);
            }else if(isJump && _sf.Speed[0] >= 0){//prepare to land
                isJump = false;
                character.setAction(2,false);
            }else if(!character.IsInSand &&  _sf.Speed[0] >= _sf.GravityNum + 0.1){//landing
                character.setAction(2,false);
            }else if(isRun && isMove){//Run
                waitJump();
                isJump = false;
                if(jumpWait == 0){
                    jumpTimes = 0;
                }
                character.setAction(4,false);
            }else if(isMove){//Walk
                waitJump();
                isJump = false;
                if(jumpWait == 0){
                    jumpTimes = 0;
                }
                character.setAction(3,false);
            }else{//Stand
                waitJump();
                if(jumpWait == 0){
                    jumpTimes = 0;
                }
                isJump = false;
                character.setAction(0,false);
            }
        }

        if(_sf.IsGravity){
            var tempSand = 0;
            if(character.BlockBelow >= 2000){
                tempSand = character.BlockBelow;
            }else if(character.BlockContact >= 2000){
                tempSand = character.BlockContact;
            }
            if(tempSand >= 3000) {
                character.IsInSand = true;
                character.SandNum = (tempSand - 3000) / 100;
            }else if(tempSand >= 2000){
                character.IsInSand = true;
                character.SandNum = (tempSand - 2000) / 100;
            }else{
                character.IsInSand = false;
            }
            if(character.IsInSand){//If the character is in the sand, he will own a large buffer resistance
                _sf.Speed[0] += character.SandNum;
                if(_sf.Speed[0] > character.SandNum){
                    _sf.Speed[0] = character.SandNum;
                }
            }else{
                _sf.Speed[0] += _sf.GravityNum;
            }

        }
        character.resetPublicBlock();
        character.y += _sf.Speed[0];
        character.x += _sf.Speed[1];

        moveWait += Math.abs(_sf.Speed[1]);
        if(moveWait > 10){
            moveWait = 0;
            if(_sf.camp == 0){
                RV.GameData.step += 1;
            }
            _sf.moveNum += 1;
        }
        if(RV.NowSet.setAll.ctrlUpDown == 1 && !_sf.IsGravity){
            moveWaitUD += Math.abs(_sf.Speed[0]);
            if(moveWaitUD > 10){
                moveWaitUD = 0;
                if(_sf.camp == 0){
                    RV.GameData.step += 1;
                }
                _sf.moveNum += 1;
            }
        }


        //if(character.CannotMoveX && !isJumpBlock()){
        //    _sf.Speed[1] = 0;
        //}
        if(character.CannotMoveY && !isJumpBlock()){
            _sf.Speed[0] = 0;
        }
    }

    /**
     * touch the enemy
     */
    function updateEnemyCollision(){
        if(_sf.camp == 0){//only actor
            var enemy = RV.NowMap.getEnemys();
            for(var i = 0;i < enemy.length;i++){
                if(enemy[i].getActor().camp == 1 && enemy[i].visible && enemy[i].getData().isContactInjury && !enemy[i].getActor().isDie && enemy[i].getRect().intersects(character.getCharactersRect())){
                    _sf.injure(3,enemy[i]);
                }
            }
        }
    }

    /**
     * correction of actor movement
     */
    function speedRecovery(){
        if(_sf.Speed[1] > 0){
            if(character.BlockBelow == 1){
                _sf.Speed[1] -= 0.01;
            }else if(isSquat){
                _sf.Speed[1] -= 0.12;
            }else if(character.IsInSand){
                _sf.Speed[1] -= character.SandNum / 10;
            }else{
                _sf.Speed[1] -= 0.15;
            }

            if(_sf.Speed[1] < 0){
                _sf.Speed[1] = 0;
            }
        }else if(_sf.Speed[1] < 0){
            if(character.BlockBelow == 1){
                _sf.Speed[1] += 0.01;
            }else if(isSquat){
                _sf.Speed[1] += 0.12;
            }else if(character.IsInSand){
                _sf.Speed[1] += character.SandNum / 10;
            }else{
                _sf.Speed[1] += 0.15;
            }
            if(_sf.Speed[1] > 0){
                _sf.Speed[1] = 0;
            }
        }else{
            _sf.Speed[1] = 0;
        }
    }

    /**
     * Can jump or not
     * @returns {boolean|*} can jump or not
     */
    function isCanJump(){
        return (character.IsInSand || (_sf.JumpTimes == -1 || jumpTimes < _sf.JumpTimes )) ;
    }

    /**
     * CD of jump
     */
    function waitJump(){
        if(jumpWait >= 0){
            jumpWait -= 1;
        }
    }

    /**
     * Interactive Block
     */
    function updateBlock(){
        //only actor
        if(_sf == RV.NowMap.getActor()){
            if(character.InteractionBlockContact != null){
                character.InteractionBlockContact.doEvent(1);
            }
            if(character.InteractionBlockBelow != null){
                character.InteractionBlockBelow.doEvent(3);
                if(character.InteractionBlockBelow.getData().isJump){
                    character.InteractionBlockBelow.doEvent(5);
                }

            }
        }
        //Bounce Block
        if(character.InteractionBlockBelow != null && character.InteractionBlockBelow.getData().isJump){
            if(_sf.Speed[0] > 0){
                if(_sf.Speed[0] > _sf.JumpNum){
                    _sf.Speed[0] *= -0.8;
                }else{
                    _sf.Speed[0] = _sf.JumpNum;

                }
            }
            character.InteractionBlockBelow = null;
        }else if(isJumpBlock()){
            _sf.Speed[0] *= -0.8;
            _sf.Speed[1] *= -2;
            //correct the speed again to prevent two bounce blocks influence each other.
            if(_sf.Speed[1] > 30){
                _sf.Speed[1] = 30;
            }else if(_sf.Speed[1] < -30){
                _sf.Speed[1] = -30;
            }
            character.InteractionBlockBelow = null;
            character.InteractionBlockContact = null;

        }
        //Disappearance Block
        if(character.InteractionBlockBelow != null && character.InteractionBlockBelow.getData().isVanish){
            character.InteractionBlockBelow.disappear();
            character.InteractionBlockBelow = null;
        }
    }

    /**
     * Bounce Block or not
     * @returns {boolean}
     */
    function isJumpBlock(){
        return character.InteractionBlockContact != null && character.InteractionBlockContact.getData().isJump;
    }

    /**
     * Death and damage decision, call back to the parent
     */
    function death(){
        if(!_sf.isDie && ((RV.NowSet.setAll.blockDieToDie && ((character.BlockBelow == 3 || character.BlockContact == 3) || //touch DeathBlock
            (character.InteractionBlockContact != null && character.InteractionBlockContact.getData().isDie)))  ||
            character.getSpirte().y >= data[0].length * RV.NowProject.blockSize || character.isSandDie ||
            (RV.NowMap.viewMove && RV.NowMap.viewDir == 0 && character.getSpirte().y >= Math.abs(view.oy) + view.height) ||
            (RV.NowMap.viewMove && RV.NowMap.viewDir == 1 && character.getSpirte().y + character.getSpirte().height < Math.abs(view.oy) - 100) )){
            _sf.deathDo();
        }else if(_sf.invincibleTime <= 0 &&( (!RV.NowSet.setAll.blockDieToDie && ((character.BlockBelow == 3 || character.BlockContact == 3) || //touch DeathBlock
            (character.InteractionBlockContact != null && character.InteractionBlockContact.getData().isDie)))) ){
            var num = 0;
            if(RV.NowSet.setAll.blockDieType == 0){
                num = RV.NowSet.setAll.blockDieNum1;
            }else{
                num = RV.NowSet.setAll.blockDieNum2 / 100;
            }
            if(character.InteractionBlockContact != null){
                character.InteractionBlockContact = null;
            }
            if(character.InteractionBlockContact != null){
                character.InteractionBlockContact = null;
            }
            if(character.BlockBelow != null){
                character.BlockBelow = null;
            }
            if(character.BlockContact != null){
                character.BlockContact = null;
            }
            _sf.injure(RV.NowSet.setAll.blockDieType,num);
        }
    }

    /**
     * Injury effect
     * @param time
     */
    function addinjureAction(time){
        character.getSpirte().flash(IColor.Black(),1);
        var times = parseInt(time / 60);
        if(character.getSpirte().actionList.length > 0) return;
        for(var i = 0;i<times;i++){
            character.getSpirte().addAction(action.fade,1,0.5,20);
            character.getSpirte().addAction(action.wait,10);
            character.getSpirte().addAction(action.fade,0.5,1,20);
            character.getSpirte().addAction(action.wait,10);
            character.getSpirte().addAction(action.fade,1,0.5,20);
            character.getSpirte().addAction(action.wait,10);
            character.getSpirte().addAction(action.fade,0.5,1,20);
            character.getSpirte().addAction(action.wait,10);
            character.getSpirte().addAction(action.fade,1,0.5,20);
            character.getSpirte().addAction(action.wait,10);
            character.getSpirte().addAction(action.fade,0.5,1,20);
            character.getSpirte().addAction(action.wait,10);
        }

    }
    /**
     * Processing movement commands
     */
    function updateAction(){
        if(!_sf.actionStart || actionList.length <= 0) return;
        if(actionWait > 0){
            actionWait -= 1;
            return;
        }
        if(actionJump){
            var tempSpeed = _sf.baseSpeed;
            if(actionJumpHeightY - actionJumpHeight > RV.NowProject.blockSize * 1.5){
                tempSpeed = _sf.baseSpeed / ( Math.abs(actionJumpHeightY - actionJumpHeight) / (RV.NowProject.blockSize * 1.5));
            }

            if(moveDir == 0){//jump left
                if(tempJumpX == "noX"){
                    character.x += tempSpeed;
                }else{
                    tempJumpX += tempSpeed;
                }
            }else if(moveDir == 1){
                if(tempJumpX == "noX"){
                    character.x -= tempSpeed;
                }else{
                    tempJumpX += tempSpeed;
                }
            }else if(moveDir == -1){
                tempJumpX += tempSpeed;
            }
            var tempy = actionJumpHeightA * Math.pow(character.x - actionJumpHeightX,2) + actionJumpHeight;
            if(tempJumpX != "noX"){
                tempy = actionJumpHeightA * Math.pow(tempJumpX  - actionJumpHeightX,2) + actionJumpHeight;
            }
            character.y = tempy;
            if((moveDir == 1 && character.x != actionJumpHeightX && character.x <= moveDis) ||
                (moveDir == 0 && character.x != actionJumpHeightX && character.x >= moveDis) ||
                (moveDir == -1 && character.y <= actionJumpHeight) ||
                (tempJumpX != "noX" && tempJumpX >= moveDis)){
                _sf.IsGravity = oldGravity;
                _sf.actionLock = oldLock;
                actionJump = false;
            }
            if(character.CannotMoveX || character.CannotMoveY){
                _sf.IsGravity = oldGravity;
                _sf.actionLock = oldLock;
                actionJump = false;
            }
            return;
        }
        if(actionMove){
            if(_sf.baseSpeed > 2) isRun = true;
            var mindir = -1;
            if(moveDir == 0){
                if(moveDis <= character.y){
                    _sf.moveUp();
                }else{
                    actionMove = false;
                }
            }else if(moveDir == 1){
                if(moveDis >= character.y){
                    _sf.moveDown();
                }else{
                    actionMove = false;
                }
            }else if(moveDir == 2){
                if(moveDis <= character.x){
                    _sf.moveLeft();
                }else{
                    actionMove = false;
                }
            }else if(moveDir == 3){
                if(moveDis >= character.x){
                    _sf.moveRight();
                }else{
                    actionMove = false;
                }
            }else if(moveDir == 5){//Toward Actor
                var actor = RV.NowMap.getActor().getCharacter();
                if(_sf.IsGravity){//if gravity is ON, only left and right should be consider
                    if(character.x > actor.x + RV.NowProject.blockSize){
                        _sf.moveLeft();
                        mindir = 2;
                        moveDis -= Math.abs(_sf.Speed[1]);
                    }
                    if(character.x < actor.x - RV.NowProject.blockSize ){
                        _sf.moveRight();
                        mindir = 3;
                        moveDis -= Math.abs(_sf.Speed[1]);
                    }
                }else{
                    if(character.y > actor.y){
                        _sf.moveUp();
                        mindir = 0;
                    }
                    if(character.y < actor.y){
                        _sf.moveDown();
                        mindir = 1;
                    }
                    if(character.x > actor.x){
                        _sf.moveLeft();
                        mindir = 2;
                    }
                    if(character.x < actor.x){
                        _sf.moveRight();
                        mindir = 3;
                    }
                    moveDis -= Math.max(Math.abs(_sf.Speed[1]) , Math.abs(_sf.Speed[0]) );
                }

                if(moveDis <= 0){
                    actionMove = false;
                }

            }
            if(actionIgnore && ((moveDir == 2 || moveDir == 3 || mindir == 2 || mindir == 3) && character.CannotMoveX)
                || ((moveDir == 0 || moveDir == 1 || mindir == 0 || mindir == 1) && character.CannotMoveY)){
                actionMove = false;
            }
            //update movement
            return;
        }
        actionPos += 1;
        if(actionPos > actionList.length - 1){
            if(actionLoop){
                actionPos = 0;
            }else{
                _sf.IsGravity = oldGravity;
                _sf.baseSpeed = oldSpeed;
                character.actionRate = oldRate;
                actionPos = -1;
                actionList = [];
                _sf.actionStart = false;
                return;
            }
        }
        nowAction = actionList[actionPos];
        if(nowAction.code == 4101){//move

            moveDir = parseInt(nowAction.args[0]);
            if(moveDir == 4){//random
                if(_sf.IsGravity){
                    moveDir = RF.RandomChoose([2,3]);
                }else{
                    moveDir = RF.RandomChoose([0,1,2,3]);
                }

            }else if(moveDir == 5){//actor
                if(_sf == RV.NowMap.getActor()){//limit actor
                    return;
                }
            }else if(moveDir == 6){//Forward
                if(_sf.getDir() == 0){
                    moveDir = 3;
                }else{
                    moveDir = 2;
                }
            }else if(moveDir == 7){//Retreat
                if(_sf.getDir() == 0){
                    moveDir = 2;
                }else{
                    moveDir = 3;
                }
            }
            if(nowAction.args[2] == "0"){
                moveDis = parseInt(nowAction.args[1]) * RV.NowProject.blockSize;
            }else {
                moveDis = parseInt(nowAction.args[1]);
            }
            if(moveDir == 0){//up
                moveDis = character.y - moveDis;
            }else if(moveDir == 1){//down
                moveDis = character.y + moveDis;
            }else if(moveDir == 2){//left
                moveDis = character.x - moveDis;
            }else if(moveDir == 3){//right
                moveDis = character.x + moveDis;
            }
            actionMove = true;
        }else if(nowAction.code == 4102){//jump
            oldLock = _sf.actionLock;
            oldGravity = _sf.IsGravity;
            tempJumpX = "noX";
            var y = 0;
            if(nowAction.args[2] == "0"){
                moveDis = parseInt(nowAction.args[0]) * RV.NowProject.blockSize;
                y = parseInt(nowAction.args[1]) * RV.NowProject.blockSize;
            }else{
                moveDis = parseInt(nowAction.args[0]);
                y = parseInt(nowAction.args[1]);
            }
            y = y + character.y;
            actionJumpHeight = parseInt(Math.min(character.y , y )) - RV.NowProject.blockSize ;
            moveDis = character.x + moveDis;
            if(moveDis > character.x){
                actionJumpHeightX = character.x +  (moveDis - character.x) / 2;
            }else {
                actionJumpHeightX =  moveDis +  (character.x - moveDis) / 2
            }

            if(moveDis > character.x){
                moveDir = 0;
            }else if(moveDis == character.x){
                moveDir = -1;
            }else{
                moveDir = 1
            }
            actionJumpHeightY = character.y;
            if(character.x == actionJumpHeightX){
                actionJumpHeightA = (character.y - actionJumpHeight) / Math.pow((character.x - (actionJumpHeightX + 32)),2);
                tempJumpX = character.x - 32;
            }else{
                actionJumpHeightA = (character.y - actionJumpHeight) / Math.pow((character.x - actionJumpHeightX),2);
            }
            actionJump = true;
            character.setAction(1,false);
            _sf.actionLock = true;
            _sf.IsGravity = false;
        }else if(nowAction.code == 4104){//change speed
            _sf.baseSpeed = 1 + (parseInt(nowAction.args[0]) - 1) * 0.5;
            oldSpeed = _sf.baseSpeed;
        }else if(nowAction.code == 4105){//change Frequency
            _sf.actionRate = parseInt(nowAction.args[0]);
            oldRate =  _sf.actionRate;
        }else if(nowAction.code == 4106){//change image
            var res = RV.NowRes.findResActor(parseInt(nowAction.args[0]));
            if(res != null){
                character.changeImage(res);
            }
        }else if(nowAction.code == 4107){//change direction
            var type = parseInt(nowAction.args[0]);
            if(type == 0){
                character.setLeftRight(false);
            }else if(type == 1){
                character.setLeftRight(true);
            }else if(type == 2 && _sf != RV.NowMap.getActor()){
                character.setLeftRight(character.x > RV.NowMap.getActor().getCharacter().x);
            }else if(type == 3 &&  _sf != RV.NowMap.getActor()){
                character.setLeftRight(character.x < RV.NowMap.getActor().getCharacter().x);
            }else if(type == 4){
                var f = rand(0,10);
                character.setLeftRight(f % 2 == 0);
            }else if(type == 5){
                character.setLeftRight(!character.getSpirte().mirror);
            }
        }else if(nowAction.code == 4108){//change Opacity
            character.getSpirte().opacity = parseInt(nowAction.args[0]) / 255;
        }else if(nowAction.code == 4109){//Direction Fix ON
            character.fixedOrientation = true;
        }else if(nowAction.code == 4110){//Direction Fix OFF
            character.fixedOrientation = false;
        }else if(nowAction.code == 4111){//set actions
            _sf.actionLock = true;
            character.setAction(parseInt(nowAction.args[0]),false,false,false,true);
        }else if(nowAction.code == 4112){//Gravity ON
            _sf.IsGravity = true;
            _sf.Speed[0] = 0;
            oldGravity = true;
        }else if(nowAction.code == 4113){//Gravity OFF
            _sf.IsGravity = false;
            _sf.Speed[0] = 0;
            oldGravity = false;
        }else if(nowAction.code == 4114){//Through ON
            character.CanPenetrate = true;
        }else if(nowAction.code == 4115){//Through OFF
            character.CanPenetrate = false;
        }else if(nowAction.code == 4120){//Action Reset
            _sf.actionLock = false;
            character.reSingleTime();
        }else if(nowAction.code == 4121){//no loop
            _sf.actionLock = true;
            character.setAction(parseInt(nowAction.args[0]),false,true,false,true);
        } else if(nowAction.code == 201){//wait
            actionWait = parseInt(nowAction.args[0]);
            isMove = false;
            isRun = false;
            isRSquat = false;
        }else if(nowAction.code == 503){//SE
            RV.GameSet.playSE("Audio/" + nowAction.args[0],parseInt(nowAction.args[1]));
        }
    }
}/**
 * Created by Yitian Chen on 2019/4/8.
 * Logic of Key frame animation
 * @param res animation resource
 * @param view | viewport displayed animation
 * @param isSingle | play one time or not
 * @param actor | target actor
 * @param rect | target rectangle
 */
function LAnim(res,view,isSingle,actor,rect){
    var _sf = this;
    //==================================== Public attributes ===================================
    //callback when animation completed
    this.endDo = null;
    //tag
    this.tag   = null;
    //Whether to perform coordinate correction based on actor position
    this.pointActor = false;
    //target rectangle
    this.userRect = rect;
    //==================================== Private attributes ===================================
    //animation resource data
    var data = res;

    //Animation execution
    var animation = null;
    //Animation images
    var cofBitmap = null;
    //Animation sprite
    var sprite = null;
    //Animation playback interval
    var animationWait = 0;
    var animationIndex = -1;
    //Whether the animation is completed
    var end = false;
    //Animation actions
    var doList = [];

    if(data.anims != null && data.anims.length > 0){
        animation = data.anims[0];
        cofBitmap = new IBCof(RF.LoadCache("Animation/" + data.file),animation.x , animation.y , animation.width , animation.height);
        sprite = new ISprite(cofBitmap , data.point.type === 1 || (data.point.dir === 5) ? null : view);
        sprite.yx = 0.5;
        sprite.yy = 0.5;
        sprite.z = 500;
    }

    if(animation != null && animation.sound != "" && data.anims.length === 1){
        RV.GameSet.playSE("Audio/" + animation.sound,animation.volume);
    }

    Object.defineProperty(this, "x", {
        get: function () {
            if(sprite == null){
                return 0;
            }
            return sprite.x;
        },
        set: function (value) {
            if(sprite == null){
                return;
            }
            sprite.x = value;
        }
    });

    Object.defineProperty(this, "y", {
        get: function () {
            if(sprite == null){
                return 0;
            }
            return sprite.y;
        },
        set: function (value) {
            if(sprite == null){
                return;
            }
            sprite.y = value;
        }
    });

    /**
     * Main update
     */
    this.update = function(){
        if(data.point.type === 0 && !this.pointActor){
            this.pointUpdate();
        }
        end = sprite == null || (!sprite.isAnim() && animationIndex >=  data.anims.length - 1);
        if(end && isSingle && this.endDo != null){
            this.endDo();
            this.endDo = null;
        }
        if(data.anims.length > 1){
            if(animationWait <= 0){
                animationIndex += 1;
                if(animationIndex >=  data.anims.length){
                    if(!isSingle || sprite.isAnim()){
                        animationIndex = 0;
                    }else{
                        return;
                    }
                }
                var tempR = data.anims[animationIndex];
                cofBitmap.x = tempR.x;
                cofBitmap.y = tempR.y;
                cofBitmap.width = tempR.width;
                cofBitmap.height = tempR.height;
                animationWait = tempR.time;

                if(tempR.sound != "" && data.anims.length > 1){
                    RV.GameSet.playSE("Audio/" + tempR.sound,tempR.volume);
                }

                for(var i = 0;i<data.actionList.length;i++){
                    if(doList.indexOf(animationIndex + 1) < 0 && data.actionList[i].index === animationIndex + 1){
                        var action = data.actionList[i];
                        if(action.isOpactiy){
                            sprite.fadeTo(action.opacity / 255,action.opacityTime);
                        }
                        if(action.isZoom){
                            sprite.scaleTo(action.zoomX / 100,action.zoomY / 100,action.zoomTime);
                        }
                        if(action.isFlash){
                            RV.NowCanvas.flash(new IColor(action.color[0],action.color[1],action.color[2],action.color[3]),action.flashTime);
                        }
                        if(action.isActorFlash){
                            if(actor != null){
                                var sp = null;
                                if(actor instanceof  LTrigger){
                                    sp = actor.getCharacter().getCharacter().getSpirte();
                                }else if(actor instanceof LActor){
                                    sp = actor.getCharacter().getSpirte();
                                }else if(actor instanceof LEnemy){
                                    sp = actor.getCharacter().getSpirte();
                                }else if(actor instanceof LInteractionBlock){
                                    sp = actor.getSprite();
                                }
                                if(sp != null){
                                    sp.flash(new IColor(action.actorColor[0],action.actorColor[1],action.actorColor[2],action.actorColor[3]),action.actorFlashTime);
                                }

                            }
                        }
                        if(isSingle){
                            doList.push(animationIndex + 1);
                        }

                    }

                }

            }else{
                animationWait -= 1;
            }
        }
    };
    /**
     * update location of animation
     */
    this.pointUpdate = function() {
        var x = 0;
        var y = 0;
        var haveView = true;
        var point = data.point;
        if(point.type === 0){//Relative coordinates
            var rect = new IRect(1,1,1,1);
            if(actor != null){
                rect = actor.getUserRect();
            }else if(_sf.userRect != null){
                rect = _sf.userRect;
            }
            if(data.anims.length > 0){
                var animation = data.anims[0];
                if(point.dir === 0){//center
                    x = rect.x + (rect.width) / 2;
                    y = rect.y + (rect.height) / 2;
                }else if(point.dir === 1){//up
                    x = rect.x + (rect.width) / 2;
                    y = rect.y + (animation.height * sprite.zoomY);
                }else if(point.dir === 2){//down
                    x = rect.x + rect.width / 2;
                    y = rect.bottom - (animation.height * sprite.zoomY);
                }else if(point.dir === 3){//left
                    x = rect.x + (animation.width * sprite.zoomX);
                    y = rect.y + (rect.height) / 2;
                }else if(point.dir === 4){//right
                    x = rect.right - (animation.width * sprite.zoomX);
                    y = rect.y + (rect.height) / 2;
                }else if(point.dir === 5){//Screen
                    haveView = false;
                    x = RV.NowProject.gameWidth / 2;
                    y = RV.NowProject.gameHeight / 2;
                }
                if(animationIndex >= 0 && animationIndex < data.anims.length){
                    x += data.anims[animationIndex].dx;
                    y += data.anims[animationIndex].dy;
                }else if(animationIndex == -1 && data.anims.length > 0){
                    x += data.anims[0].dx;
                    y += data.anims[0].dy;
                }

            }
        }else{//Absolute coordinates
            haveView = false;
            x = point.x;
            y = point.y;
        }
        sprite.x = x;
        sprite.y = y;
    };

    this.pointUpdate();
    /**
     * Dispose
     */
    this.dispose = function(){
        if(sprite == null) return;
        sprite.disposeMin();
    };
    /**
     * Get sprite
     * @returns {*}
     */
    this.getSprite = function(){
        return sprite;
    };

    /**
     * Get rectangle of sprite
     * @returns {*}
     */
    this.getRect = function(){
        return sprite.GetRect();
    };

    this.fadeTo = function(o,time){
        sprite.fadeTo(o,time);
    }

}/**
 * Created by Yitian Chen on 2019/1/9.
 * Basic block logic | it is mainly used for blocks with dynamic animation
 * @param resBlock | resource of object
 * @param dataBlock | Configuration data
 * @param viewport | viewport
 * @param x | x-coordinate
 * @param y | y-coordinate
 * @param z | layer z
 */
function LBlock(resBlock , dataBlock, viewport  , x , y , z){

    var data = resBlock;
    var block = dataBlock;

    //key frame animation
    var animWait = data.anim[0].time;
    var animIndex = 0;
    //Generate drawing sprites
    var tempx = 0;
    var tempy = 0;
    var cof = null;

    var rect = new IRect(1,1,1,1);
    if(data.drawType == 0){
        cof = new IBCof(RF.LoadCache("Block/" + data.file) , data.anim[0].x, data.anim[0].y, data.anim[0].width, data.anim[0].height);
    }else if(data.drawType == 1){
        tempx = block.drawIndex % 8;
        tempy = parseInt(block.drawIndex / 8);
        cof = new IBCof(RF.LoadCache("Block/" + data.file), data.anim[0].x + tempx * RV.NowProject.blockSize,
            data.anim[0].y + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
    }else if(data.drawType == 2){
        tempx = block.drawIndex % 3;
        tempy = parseInt(block.drawIndex / 3);
        cof = new IBCof(RF.LoadCache("Block/" + data.file), data.anim[0].x + tempx * RV.NowProject.blockSize,
            data.anim[0].y + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
    }

    var sprite = new ISprite(cof , viewport);
    sprite.z = z;
    sprite.x = x * RV.NowProject.blockSize;
    sprite.y = y * RV.NowProject.blockSize;
    /**
     * Main update
     */
    this.update = function(){
        //Update animation
        if(data.anim.length > 1){
            if(animWait == 0){
                animIndex += 1;
                if(animIndex >=  data.anim.length){
                    animIndex = 0;
                }
                var tempR = data.anim[animIndex];
                cof.x = tempR.x + tempx * RV.NowProject.blockSize;
                cof.y = tempR.y + tempy * RV.NowProject.blockSize;
                cof.width = RV.NowProject.blockSize;
                cof.height = RV.NowProject.blockSize;
                animWait = tempR.time;
            }else{
                animWait -= 1;
            }
        }
    };
    /**
     * Get sprite of the object
     * @returns {ISprite}
     */
    this.getSprite = function(){
        return sprite;
    };
    /**
     * Dispose
     */
    this.dispose = function(){
        sprite.disposeMin();
    };

    /**
     * Get rectangle
     * @returns {*}
     */
    this.getRect = function(){
        rect.left = sprite.x;
        rect.top = sprite.y;
        rect.right = sprite.x + sprite.width;
        rect.bottom = sprite.y + sprite.height;
        return rect;
    };
    /**
     * Change image of block
     * @param rBlock
     */
    this.changeBitmap = function(rBlock){
        data = rBlock;
        animWait = data.anim[0].time;
        animIndex = 0;
        tempx = 0;
        tempy = 0;
        cof = null;

        if(data.drawType == 0){
            cof = new IBCof(RF.LoadCache("Block/" + data.file) , data.anim[0].x, data.anim[0].y, data.anim[0].width, data.anim[0].height);
        }else if(data.drawType == 1){
            tempx = block.drawIndex % 8;
            tempy = parseInt(block.drawIndex / 8);
            cof = new IBCof(RF.LoadCache("Block/" + data.file), data.anim[0].x + tempx * RV.NowProject.blockSize,
                data.anim[0].y + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
        }else if(data.drawType == 2){
            tempx = block.drawIndex % 3;
            tempy = parseInt(block.drawIndex / 3);
            cof = new IBCof(RF.LoadCache("Block/" + data.file), data.anim[0].x + tempx * RV.NowProject.blockSize,
                data.anim[0].y + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
        }

        sprite.setBCof(cof);
    }

}/**
 * Created by Yitian Chen on 2019/4/11.
 * Logic of bullet
 * @param bullet | bullet configuration data
 * @param owner | object of bullet
 * @param view | viewport
 * @param x | Initialize x
 * @param y | Initialize y
 * @param obj
 */
function LBullet( bullet , owner , view , x , y,obj){
    //array of bullet sprite
    var sprite = [];
    //animation array
    var anim = [];
    //set bullet data
    var data = bullet;
    var animData = null;
    //Correct bullet angle
    var defAngle = data.angle;
    var spAngel = (defAngle - (data.range / 2));
    if(owner.getDir() == 1){
        defAngle %= 360;
        if(defAngle == 0 || defAngle == 90 || defAngle == 180 || defAngle == 360){
            defAngle += 180;
        }else if(defAngle > 0 && defAngle < 90){
            defAngle += (90 - defAngle) * 2;
        }else if(defAngle > 90 && defAngle <180){
            defAngle = 90-(defAngle - 90);
        }else if(defAngle > 270 && defAngle < 360){
            defAngle = defAngle - (90 - (360 - defAngle)) * 2;
        }else if(defAngle > 180 && defAngle < 270){
            defAngle = defAngle + (360 - defAngle - 90) * 2
        }
    }

    var baseAngle = (defAngle - (data.range / 2));
    var di = data.bulletNum - 1;
    if(di == 0) {
        di = 1;
        baseAngle = defAngle;
    }
    var minAngle = data.range / di;

    var actors = [];
    var time = data.time;
    if(time == -1){
        time = 999999;
    }

    //Call back after the bullet is fired
    this.endDo = null;

    if(data.userPic){//Single Picture
        for(var i = 0;i< data.bulletNum;i++){
            var angle2 = Math.PI * (baseAngle + (minAngle * i)) / 180;
            var diffx = Math.cos(angle2) * data.bulletSpeed;
            var diffy = Math.sin(angle2) * data.bulletSpeed;
            var sp = new ISprite(RF.LoadCache("Animation/" + data.picFile),view);
            sp.x = x ;
            sp.y = y ;
            sp.yx = 0.5;
            sp.yy = 0.5;
            sp.z = 500;
            var tempAngle = baseAngle;
            if(data.bulletNum <= 1){
                sp.angle = data.angle;
            }else{
                sp.angle = spAngel + (minAngle * i);
                tempAngle = baseAngle + (minAngle * i);
            }
            sp.tag = [diffx , diffy , tempAngle , tempAngle];
            if(owner.getDir() == 1){
                sp.mirror = true;
            }
            sprite.push(sp);

        }

    }else if(data.userAnim) {//Animation
        for(i = 0;i< data.bulletNum;i++){
            angle2 = Math.PI * (baseAngle + (minAngle * i)) / 180;
            diffx = Math.cos(angle2) * data.bulletSpeed;
            diffy = Math.sin(angle2) * data.bulletSpeed;
            var am =  makerAnim(data.animId);
            var baseX = correctAnimX(x);
            var baseY = correctAnimY(y);
            am.userRect = new IRect(baseX - 5,baseY - 5,baseX + 5,baseY + 5);

            tempAngle = baseAngle;
            //am.pointActor = true;
            if(am instanceof LAnim){
                sp = am.getSprite();
                var tempR = sp.GetRect();
                am.userRect = new IRect(baseX - tempR.width / 2,baseY - tempR.height / 2,baseX + tempR.width / 2,baseY + tempR.height / 2);
                if(sp != null){
                    if(data.bulletNum <= 1){
                        sp.angle = data.angle;
                    }else{
                        sp.angle = spAngel + (minAngle * i);
                        tempAngle = baseAngle + (minAngle * i);
                    }
                    if(owner.getDir() == 1){
                        sp.mirror = true;
                    }
                }

                am.tag = [diffx , diffy, tempAngle , tempAngle];
            }else{
                var angel = 0;
                if(data.bulletNum <= 1){
                    angel = defAngle;
                }else{
                    angel = baseAngle + (minAngle * i);
                }
                am.tag = [diffx , diffy, angel , angel];
            }
            am.pointUpdate();
            anim.push(am);
        }
    }

    /**
     * X-coordinate correction
     * @param value
     * @returns {number}
     */
    function correctAnimX(value){
        var point = animData.point;
        var x = 0;
        if(point.type == 0){//Relative coordinates
            if(animData instanceof DResAnimFrame){
                if(animData.anims.length > 0){
                    var animation = animData.anims[0];
                    if(point.dir == 0){//center
                        x = value;
                    }else if(point.dir == 1){//up
                        x = value - (animation.height) / 2;
                    }else if(point.dir== 2){//down
                        x = value + (animation.height) / 2;
                    }else if(point.dir == 3){//left
                        x = value - (animation.width) / 2;
                    }else if(point.dir == 4){//right
                        x = value - (animation.width) / 2;
                    }else if(point.dir == 5){//screen
                        x = 0;
                    }
                }
            }else if(animData instanceof  DResAnimParticle){
                if(point.dir == 5){//Screen
                    x = 0;
                }else{
                    x = value;
                }
            }
        }else{//Absolute coordinates
            x = point.x;
        }
        return x;
    }

    /**
     * Y-coordinate correction
     * @param value
     * @returns {number}
     */
    function correctAnimY(value){
        var point = animData.point;
        var y = 0;
        if(point.type == 0){//Relative coordinates
            if(animData instanceof DResAnimFrame){
                if(animData.anims.length > 0){
                    var animation = animData.anims[0];
                    if(point.dir == 0){//center
                        y = value + (animation.height) / 2;
                    }else if(point.dir == 1){//up
                        y = value;
                    }else if(point.dir== 2){//down
                        y = value - animation.height;
                    }else if(point.dir == 3){//left
                        y = value + (animation.height) / 2;
                    }else if(point.dir == 4){//right
                        y = value + (animation.height) / 2;
                    }else if(point.dir == 5){//screen
                        y = 0;
                    }
                }
            }else if(animData instanceof  DResAnimParticle){
                if(point.dir == 5){//screen
                    y = 0;
                }else{
                    y = value;
                }
            }
        }else{//Absolute coordinates
            y = point.y;
        }
        return y;
    }

    /**
     * Generate the animation of bullet
     * @param animId | animation resourceID
     * @returns {*}
     */
    function makerAnim(animId){
        var data = RV.NowRes.findResAnim(animId);
        animData = data;
        var am = null;
        var haveView = true;
        var point = data.point;

        if(point.type == 0){//Relative coordinates
            if(owner != null){
                if(data instanceof DResAnimFrame){
                    if(data.anims.length > 0){
                        var animation = data.anims[0];
                        if(point.dir == 5){//Screen
                            haveView = false;
                        }
                    }

                }else if(data instanceof  DResAnimParticle){
                   if(point.dir == 5){//Screen
                        haveView = false;
                    }
                }
            }
        }else{//Absolute coordinates
            haveView = false;
        }

        if(data instanceof DResAnimFrame){
            am = new LAnim(data,haveView ? RV.NowMap.getView() : null,false);
        }else if(data instanceof  DResAnimParticle){
            am = new LParticle(data,haveView ? RV.NowMap.getView() : null,false);
        }

        return am;
    }

    /**
     * Main update
     */
    this.update = function(){

        if(time > 0){
            time -= 1;
        }

        if(sprite.length <= 0 && anim.length <= 0 && this.endDo != null ){
            this.endDo();
            this.endDo = null;
        }
        for(var i = sprite.length - 1;i >= 0;i--){
            var tag = sprite[i].tag;
            //Track
            if(data.isTrack){
                var tempA = getAngle(sprite[i].x,sprite[i].y);
                if(tempA == null){
                    var hd = sprite[i].tag[3] * (Math.PI/180);
                    sprite[i].x += Math.cos(hd) * data.bulletSpeed;
                    sprite[i].y += Math.sin(hd) * data.bulletSpeed;
                    sprite[i].angle = sprite[i].tag[3];
                }else{
                    var jd = parseInt(tempA * (180/Math.PI));
                    var tempJd = parseInt(sprite[i].tag[3] % 360);
                    sprite[i].tag[3] = tempJd;
                    if(tempJd != jd && tempJd - jd > 180){
                        sprite[i].tag[3] = (tempJd + 1) % 360;
                    }else if(tempJd != jd && tempJd - jd < -180){
                        sprite[i].tag[3]  -= 1;
                    }else if(tempJd != jd && tempJd - jd >= 0){
                        sprite[i].tag[3]  -= 1;
                    }else if(tempJd != jd && tempJd - jd < 0){
                        sprite[i].tag[3] = (tempJd + 1) % 360;
                    }
                    hd = sprite[i].tag[3] * (Math.PI/180);
                    sprite[i].x += Math.cos(hd) * data.bulletSpeed;
                    sprite[i].y += Math.sin(hd) * data.bulletSpeed;
                    sprite[i].angle = sprite[i].tag[3];
                }
            }else{
                sprite[i].x += tag[0];
                sprite[i].y += tag[1];
                if(data.isGravity){
                    tag[1] += (RV.GameData.gravityNum / 100) * RV.NowMap.getData().gravity;
                }
            }

            if(atkJudge(sprite[i].GetRect(),tag[0]) && !data.isPenetration){
                sprite[i].disposeMin();
                sprite.remove(sprite[i]);
                continue;
            }
            if(time == 10){
                sprite[i].fadeTo(0,10);
            }
            if(sprite[i].x  > RV.NowMap.getData().width * RV.NowProject.blockSize || sprite[i].x < 0 ||
                sprite[i].y > RV.NowMap.getData().height * RV.NowProject.blockSize || sprite[i].y < 0 || time <= 0){
                sprite[i].disposeMin();
                sprite.remove(sprite[i]);
            }


        }

        for(i = anim.length - 1;i >= 0;i--){

            tag = anim[i].tag;
            if(data.isTrack){
                tempA = getAngle(anim[i].userRect.left,anim[i].userRect.top);
                if(tempA == null){
                    hd = tag[3] * (Math.PI/180);
                    var sx =  Math.cos(hd) * data.bulletSpeed;
                    var sy = Math.sin(hd) * data.bulletSpeed;
                    anim[i].userRect.left += sx;
                    anim[i].userRect.right += sx;
                    anim[i].userRect.top += sy;
                    anim[i].userRect.bottom += sy;
                    if(anim[i] instanceof LAnim){
                        anim[i].getSprite().angle = tag[3];
                    }

                }else{
                    jd = parseInt(tempA * (180/Math.PI));
                    tempJd = parseInt(tag[3] % 360);
                    tag[3] = tempJd;
                    if(tempJd != jd && tempJd - jd > 180){
                        tag[3] = (tempJd + 1) % 360;
                    }else if(tempJd != jd && tempJd - jd < -180){
                        tag[3]  -= 1;
                    }else if(tempJd != jd && tempJd - jd >= 0){
                        tag[3]  -= 1;
                    }else if(tempJd != jd && tempJd - jd < 0){
                        tag[3] = (tempJd + 1) % 360;
                    }
                    hd = tag[3] * (Math.PI/180);

                    sx =  Math.cos(hd) * data.bulletSpeed;
                    sy = Math.sin(hd) * data.bulletSpeed;

                    anim[i].userRect.left += sx;
                    anim[i].userRect.right += sx;
                    anim[i].userRect.top += sy;
                    anim[i].userRect.bottom += sy;
                    if(anim[i] instanceof LAnim){
                        anim[i].getSprite().angle = tag[3];
                    }
                }
            }else{
                anim[i].userRect.left += tag[0];
                anim[i].userRect.right += tag[0];
                anim[i].userRect.top += tag[1];
                anim[i].userRect.bottom += tag[1];
                if(data.isGravity){
                    tag[1] += (RV.GameData.gravityNum / 100) * RV.NowMap.getData().gravity;
                }
            }
            anim[i].update();
            if(atkJudge(anim[i].userRect,tag[0]) && !data.isPenetration){
                anim[i].dispose();
                anim.remove(anim[i]);
                continue;
            }
            if(time == 10){
                if(anim[i] instanceof LAnim){
                    anim[i].fadeTo(0,10);
                }
            }
            if(anim[i].userRect.centerX > RV.NowMap.getData().width * RV.NowProject.blockSize || anim[i].userRect.centerX < 0 ||
                anim[i].userRect.centerY > RV.NowMap.getData().height * RV.NowProject.blockSize || anim[i].userRect.centerY < 0 || time <= 0){
                anim[i].dispose();
                anim.remove(anim[i]);
            }
        }


    };
    /**
     * Dispose
     */
    this.dispose = function(){
        for(var i = sprite.length - 1;i >= 0;i--){
            sprite[i].disposeMin();
        }
        for(i = anim.length - 1;i >= 0;i--){
            anim[i].dispose();
        }
    };

    function getAngle(bx,by){
        var angle = 0;
        var PI = Math.PI;
        var dis = 999999;
        var endRect = null;
        if(owner.camp == 0 || owner.camp == 2){//actor
            for(var i = 0;i<RV.NowMap.getEnemys().length;i++){
                if(RV.NowMap.getEnemys()[i].getActor().camp == 1 && RV.NowMap.getEnemys()[i].visible && !RV.NowMap.getEnemys()[i].isDie && actors.indexOf(RV.NowMap.getEnemys()[i].getActor()) < 0){
                    var tempRect = RV.NowMap.getEnemys()[i].getRect();
                    //Calculate the distance between two points
                    var tempDis = Math.abs( Math.sqrt( Math.pow((bx - tempRect.centerX),2) + Math.pow((by - tempRect.centerY),2) ) );
                    if(tempDis < dis){
                        dis = tempDis;
                        endRect = tempRect;
                    }
                }
            }
        }else if(owner.camp == 1){//Enemies
            for(i = 0;i<RV.NowMap.getEnemys().length;i++){
                if(RV.NowMap.getEnemys()[i].getActor().camp == 2 && RV.NowMap.getEnemys()[i].visible && !RV.NowMap.getEnemys()[i].isDie && actors.indexOf(RV.NowMap.getEnemys()[i].getActor()) < 0){
                    tempRect = RV.NowMap.getEnemys()[i].getRect();
                    //Calculate the distance between two points
                    tempDis = Math.abs( Math.sqrt( Math.pow((bx - tempRect.centerX),2) + Math.pow((by - tempRect.centerY),2) ) );
                    if(tempDis < dis){
                        dis = tempDis;
                        endRect = tempRect;
                    }
                }
            }

            //actor
            tempRect = RV.NowMap.getActor().getCharacter().getCharactersRect();
            tempDis = Math.abs( Math.sqrt( Math.pow((bx - tempRect.centerX),2) + Math.pow((by - tempRect.centerY),2) ) );
            if(tempDis < dis){
                dis = tempDis;
                endRect = tempRect;
            }

        }
        //Calculate deflection angle
        if(endRect != null){
            var deltax = endRect.centerX - bx;
            var deltay = endRect.centerY - by;
            if(deltax == 0){
                if(endRect.centerY  == by){
                    deltax = 0.0001;
                }else{
                    deltax = -0.0001;
                }
            }
            if(deltay == 0){
                if(endRect.centerX  == bx){
                    deltay = 0.0001;
                }else{
                    deltay = -0.0001;
                }
            }
            if( deltax>0 && deltay>0 ){
                angle = Math.atan(Math.abs(deltay/deltax));           // First quadrant√
            }else if( deltax<0 && deltay<0 ){
                angle = PI + Math.atan(Math.abs(deltay/deltax)) ;       // Third quadrant
            }else if( deltax<0 && deltay>0 ){
                angle = PI-Math.atan(Math.abs(deltay/deltax));          // Beta Quadrant
            }else{
                angle = 2*PI-Math.atan(Math.abs(deltay/deltax));        // Delta Quadrant √
            }
            return angle;
        }
        return null;
    }

    /**
     * Attack decision
     * @param rect | Decision rectangle
     * @param xSpeed | Speed of bullet
     * @returns {boolean}
     */
    function atkJudge(rect,xSpeed){
        //decision of block
        if(!data.isPenetration){
            var bx = parseInt((rect.x + rect.width / 2) / RV.NowProject.blockSize);
            var by = parseInt((rect.y - rect.height / 2) / RV.NowProject.blockSize);
            var bb = RV.NowMap.getMapData()[bx];
            if(bb != null){
                var block = RV.NowMap.getMapData()[bx][by];
                if(block != null && block >= 0 && block != 4){
                    return true;
                }
            }

        }
        //decision of Interactive block
        var blocks = owner.getCharacter().getInteractionBlocks();
        if(blocks != null){
            for(i = 0;i<blocks.length;i++){
                if(blocks[i].isDestroy == false && blocks[i].getData().isDestroy == true && blocks[i].isCollision(rect)){
                    blocks[i].destroy();
                    return true;
                }
            }
        }

        var enemy = RV.NowMap.getEnemys();
        if(owner.camp == 0){//actor attack

            for(i = 0;i<enemy.length;i++){
                if(enemy[i].getActor().camp == 1 && enemy[i].visible &&  enemy[i].getRect().intersects(rect) && !enemy[i].isDie && actors.indexOf(enemy[i].getActor()) < 0){
                    if(obj != null){
                        if(obj.value2 != 0){
                            enemy[i].getActor().injure(4 , obj.value2);
                        }
                        if(obj.value1 != 0){
                            if(obj.skill != null){
                                var oo = obj.skill.getBulletObj();
                                enemy[i].getActor().injure(2 , {
                                    crit : false,
                                    damage : obj.skill.endHurt(enemy[i]),
                                    repel : oo.repel,
                                    dir : oo.dir,
                                    fly : oo.fly
                                });
                            }else{
                                enemy[i].getActor().injure(0 , obj.value1);
                            }

                        }
                        for(var id in obj.buff){
                            if(obj.buff[id] == 1){
                                enemy[i].addBuff(id);
                            }else if(obj.buff[id] == 2){
                                enemy[i].subBuff(id);
                            }
                        }
                    }else{
                        enemy[i].getActor().injure(2 , RF.ActorAtkEnemy(enemy[i] , xSpeed > 0 ? 0 : 1) );
                    }
                    RV.NowMap.getActor().combatTime = 300;
                    enemy[i].getActor().combatTime = 300;
                    if(data.isPenetration){
                        actors.push(enemy[i].getActor());
                    }
                    RV.NowCanvas.playAnim(data.hitAnimId,null,enemy[i].getActor(),true);
                    return true;
                }
            }
        }else if(owner.camp == 1){//enemy

            for(i = 0;i<enemy.length;i++){
                if(enemy[i].getActor().camp == 2 && enemy[i].visible &&  enemy[i].getRect().intersects(rect) && !enemy[i].isDie && actors.indexOf(enemy[i].getActor()) < 0){
                    owner.combatTime = 300;
                    enemy[i].combatTime = 300;
                    if(obj instanceof LEnemy){
                        enemy[i].getActor().injure(2, RF.EnemyAtkEnemy(obj,enemy[i] ) );
                    }else if(obj.skill != null){
                        oo = obj.skill.getBulletObj();
                        enemy[i].getActor().injure(2 , {
                            crit : false,
                            damage : obj.skill.endHurt(RV.GameData.actor),
                            repel : oo.repel,
                            dir : oo.dir,
                            fly : oo.fly
                        });
                    }
                    for(var id in obj.buff){
                        if(obj.buff[id] == 1){
                            enemy[i].addBuff(id);
                        }else if(obj.buff[id] == 2){
                            enemy[i].subBuff(id);
                        }
                    }
                    if(data.isPenetration){
                        actors.push(enemy[i].getActor());
                    }
                    RV.NowCanvas.playAnim(data.hitAnimId,null,enemy[i].getActor(),true);
                    return true;
                }
            }

            if(RV.NowMap.getActor().getCharacter().getCharactersRect().intersects(rect) && actors.indexOf(RV.NowMap.getActor()) < 0){
                if(data.isPenetration){
                    actors.push(RV.NowMap.getActor());
                }
                owner.combatTime = 300;
                RV.NowMap.getActor().combatTime = 300;
                if(obj instanceof LEnemy){
                    RV.NowMap.getActor().injure(3,obj);
                }else if(obj.skill != null){
                    oo = obj.skill.getBulletObj();
                    RV.NowMap.getActor().injure(2 , {
                        crit : false,
                        damage : obj.skill.endHurt(RV.GameData.actor),
                        repel : oo.repel,
                        dir : oo.dir,
                        fly : oo.fly
                    });
                }
                for(var id in obj.buff){
                    if(obj.buff[id] == 1){
                        RV.GameData.actor.addBuff(id);
                    }else if(obj.buff[id] == 2){
                        RV.GameData.actor.subBuff(id);
                    }
                }
                if(data.isPenetration){
                    actors.push(RV.NowMap.getActor());
                }
                RV.NowCanvas.playAnim(data.hitAnimId,null,RV.NowMap.getActor(),true);
                return true;
            }
        }else if(owner.camp == 2){
            for(i = 0;i<enemy.length;i++){
                if(enemy[i].getActor().camp == 1 && enemy[i].visible &&  enemy[i].getRect().intersects(rect) && !enemy[i].isDie && actors.indexOf(enemy[i].getActor()) < 0){
                    owner.combatTime = 300;
                    enemy[i].combatTime = 300;
                    if(obj instanceof LEnemy){
                        enemy[i].getActor().injure(2, RF.EnemyAtkEnemy(obj,enemy[i] ) );
                    }else if(obj.skill != null){
                        oo = obj.skill.getBulletObj();
                        enemy[i].getActor().injure(2 , {
                            crit : false,
                            damage : obj.skill.endHurt(RV.GameData.actor),
                            repel : oo.repel,
                            dir : oo.dir,
                            fly : oo.fly
                        });
                    }
                    for(var id in obj.buff){
                        if(obj.buff[id] == 1){
                            enemy[i].addBuff(id);
                        }else if(obj.buff[id] == 2){
                            enemy[i].subBuff(id);
                        }
                    }
                    if(data.isPenetration){
                        actors.push(enemy[i].getActor());
                    }
                    RV.NowCanvas.playAnim(data.hitAnimId,null,enemy[i].getActor(),true);
                    return true;
                }
            }
        }
        return false;
    }



}/**
 * Created by Yitian Chen on 2019/3/18.
 * Canvas of screen
 */
function LCanvas(){

    var _sf = this;
    //Scene static
    RV.NowCanvas = this;
    //text box
    this.message = new LMessage();
    //dialog box
    this.pop = new LMessagePop(RV.NowMap.getView());
    //choice box
    this.choice = new LChoice();
    //hide text and dialog box
    this.message.re();
    this.pop.none();
    //weather
    this.weather = new LWeather();
    this.weather.init();
    //images
    this.pics = {};
    //animation
    this.anim = [];
    //bullet
    this.bullet = [];
    //skill
    this.skills = [];
    //flash images
    var flash = null;
    //mask image
    var mask = null;

    /**
     * Main update
     */
    this.update = function(){
        for(var i = 0;i<this.anim.length;i++){
            this.anim[i].update();
        }
        for(i = 0;i<this.bullet.length;i++){
            this.bullet[i].update();
        }
        for(i = 0;i<this.skills.length;i++){
            this.skills[i].update();
        }
        this.message.updateDraw();
        this.pop.update();
        this.weather.update();
        this.choice.update();
        return this.choice.isW;
    };

    /**
     * clear scene
     */
    this.clear = function(){
        _sf.message.re();
        _sf.pop.none();
        for(var key in this.pics){
            this.pics[key].dispose();
            delete this.pics[key];
        }
        for(var i = 0;i<this.bullet.length;i++){
            this.bullet[i].dispose();
            this.bullet[i] = null;
        }
        for(i = 0;i<this.skills.length;i++) {
            this.skills[i].dispose();
            this.skills[i] = null;
        }
        for(i = 0;i<this.anim.length;i++){
            this.anim[i].dispose();
            this.anim[i] = null;
        }
        this.pics = {};
        this.anim = [];
        this.bullet = [];
        this.skills = [];

    };

    /**
     * Dispose scene
     */
    this.dispose = function(){
        this.message.dispose();
        this.pop.dispose();
        this.choice.dispose();
        this.weather.dispose();
        for(var key in this.pics){
            this.pics[key].dispose();
            delete this.pics[key];
        }
        for(i = 0;i<this.bullet.length;i++){
            this.bullet[i].dispose();
            this.bullet[i] = null;
        }

        for(i = 0;i<this.anim.length;i++){
            this.anim[i].dispose();
            this.anim[i] = null;
        }
        for(i = 0;i<this.skills.length;i++){
            this.skills[i].dispose();
            this.skills[i] = null;
        }
        this.pics = {};
        this.anim = [];
        this.bullet = [];
        this.skills = [];

        if(flash != null) {
            flash.dispose();
            flash = null;
        }
        if(mask != null) {
            mask.dispose();
            mask = null;
        }
    };

    /**
     * flash
     * @param color | flash color
     * @param time | duration
     */
    this.flash = function(color,time){
        if(flash != null) {
            flash.dispose();
            flash = null;
        }
        flash = new ISprite(1,1,color);
        flash.zoomX = RV.NowProject.gameWidth;
        flash.zoomY = RV.NowProject.gameHeight;
        flash.z = 999999;
        flash.fade(1.0,0,time);
    };

    /**
     * Fadein Mask
     * @param color | color of mask
     * @param time | duration
     */
    this.maskFadeIn = function(color,time){
        if(mask != null) {
            mask.dispose();
            mask = null;
        }
        mask = new ISprite(1,1,color);
        mask.zoomX = RV.NowProject.gameWidth;
        mask.zoomY = RV.NowProject.gameHeight;
        mask.z = 999990;
        mask.fade(0,1.0,time);
    };

    /**
     * Fadeout Mask
     * @param time | duration
     */
    this.maskFadeOut = function(time){
        if(mask == null) return;
        mask.fadeTo(0 , time);
    };

    /**
     * does skills
     * @param actor | LActor object
     * @param id | ID of skill
     * @param user | target (LEnemy or GActor)
     * @param endDo | end callback
     */
    this.playSkill = function(actor , id , user , endDo){
        var data = RV.NowSet.findSkillId(id);
        if(data != null){
            var skill = new LSkill(actor , data , user);
            skill.endDo = function(){
                _sf.skills.remove(skill);
                if(endDo != null){
                    endDo();
                }
            };
            _sf.skills.push(skill);
        }else{
            if(endDo != null){
                endDo();
            }
        }

    };

    /**
     * bullet
     * @param bulletId | bullet ID
     * @param actor | LActor that Bullet belongs to
     * @param x | bulletX
     * @param y | bulletY
     * @param obj | add
     */
    this.playBullet = function(bulletId,actor,x,y,obj){
        var data = RV.NowSet.findBullet(bulletId);
        if(data == null) return;
        var bullet = new LBullet(data,actor,RV.NowMap.getView(),x,y,obj);
        bullet.endDo = function(){
            _sf.bullet.remove(bullet);
        };
        this.bullet.push(bullet);
    };

    this.findAnim = function(tag){
        for(var i = 0;i<_sf.anim.length;i++){
            if(_sf.anim[i].tag == tag){
                return _sf.anim[i];
            }
        }
        return null;
    };

    /**
     * play animation
     * @param animId | animation ID
     * @param endFuc | end callback
     * @param actor | target LActor
     * @param isSingle | play one time or not
     * @param rect | target rectangle
     * @param tag | tag
     * @returns {boolean}
     */
    this.playAnim = function(animId,endFuc,actor,isSingle,rect,tag){
        var data = RV.NowRes.findResAnim(animId);
        if(data == null) {
            if(endFuc != null){
                endFuc();
            }
            return;
        }
        var am = null;
        var haveView = true;
        var point = data.point;
        if(point.type == 0){//Relative coordinates
            if(point.dir == 5){//Screen
                haveView = false;
            }
        }else{//Absolute coordinates
            haveView = false;
        }

        if(data instanceof DResAnimFrame){
            am = new LAnim(data,haveView ? RV.NowMap.getView() : null,isSingle,actor,rect);
        }else if(data instanceof  DResAnimParticle){
            am = new LParticle(data,haveView ? RV.NowMap.getView() : null,isSingle,actor,rect);
        }
        am.tag = tag;
        am.endDo = function(){
            am.dispose();
            _sf.anim.remove(am);
            if(endFuc != null){
                endFuc();
            }

        };

        if(am != null){
            this.anim.push(am);
            return true;
        }
        return false;
    }

}/**
 * Created by Yitian Chen on 2019/1/10.
 * Logic of characters derive LActor
 * @param resActor actor resource
 * @param view | viewport
 * @param z | layer z
 * @param mdata | blocks
 * @param blocks | interactive blocks
 */
function LCharacters(resActor,view,z,mdata,blocks){
    var _sf = this;
    //==================================== Public attributes ===================================
    //Through or not
    this.CanPenetrate = false;
    //Whether it can move in the X direction
    this.CannotMoveX = false;
    //Whether it can move in the Y direction
    this.CannotMoveY = false;
    //Whether it is in Swamp Block
    this.IsInSand = false;
    //Drag Coefficient of Swamp Block
    this.SandNum = 0;
    //Whether it is die in Swamp Block
    this.isSandDie = false;
    //The blocks under the character's feet
    this.BlockBelow = null;
    //The blocks that the character touches on the left, right and top
    this.BlockContact = null;
    //Interactive blocks touched
    this.InteractionBlockContact = null;
    this.InteractionBlockBelow = null;
    //fix direction
    this.fixedOrientation = false;
    //Fix action
    this.fixedAction = false;
    //play animation
    this.playAnim = true;
    //frequency of animation playback
    this.actionRate = 5;
    this.actor = null;
    //Attack callback
    this.atkCall = null;
    this.actionCall = null;
    this.shootCall = null;
    this.isActor = false;
    //==================================== Private attributes ===================================
    //x and y coordinates
    var selfX = 0, selfY = 0;
    //Show center position X, Y
    var showX = 0, showY = 0;
    //blocks data
    var mapData = mdata;
    //resource
    var data = resActor;

    //height and width of decision
    var validWidth = 0;
    var validHeight = 0;
    var validX = 0;
    var validY = 0;

    var validRect = new IRect(1,1,1,1);

    //load configuration data
    var cofs = [];
    var tempList = [];

    for(var i = 0;i<data.actionList.length;i++){
        if(data.actionList[i].length > 0){
            var animation = data.actionList[i][0];
            cofs[i] = new IBCof(RF.LoadCache("Characters/" + data.file + data.actionName[i]) , animation.x,animation.y,animation.width,animation.height);
        }else{
            cofs[i] = null;
        }
    }
    //DResAnim of current action
    var nowAction = null;
    //IBof of current action
    var nowCof = null;
    //The height of the image above the ground (calculated dynamically based on the action)
    var difHeight = 0;
    //temporary Variable of action alternation
    var tempIndex = 0;
    //key frame animation
    var isSingleTime = false;
    var isRestore = false;
    var oldAnimationIndex = -1;
    var animationWait = 0;
    var animationIndex = -1;
    //sprite of character
    var sprite = null;

    //Draw if action frame exists
    if(cofs[0] != null){
        nowAction = data.actionList[0];
        nowCof = cofs[0];
        //calculated the height of the image above the ground
        difHeight = nowAction[0].height / 2;


        //Custom decision area
        if(!nowAction[0].collisionRect.auto){
            validWidth = nowAction[0].collisionRect.width;
            validHeight = nowAction[0].collisionRect.height;
            validX = nowAction[0].collisionRect.x;
            validY = nowAction[0].collisionRect.y;
        }else{
            validWidth = Math.max(Math.floor(data.actionList[0][0].width / RV.NowProject.blockSize),1) * RV.NowProject.blockSize - 15;
            validHeight = data.actionList[0][0].height;
        }

        sprite = new ISprite(cofs[0],view);
        sprite.z =z;
        //key frame animation
        animationWait = nowAction[0].time;
        animationIndex = -1;
    }
    //==================================== Overridden properties ===================================
    /**
     * set X of character
     */
    Object.defineProperty(this, "x", {
        get: function () {
            return selfX;
        },
        set: function (value) {
            _sf.CannotMoveX = true;
            var dir = -1;
            if(value < selfX) dir = 0;//left
            if(value > selfX) dir = 1;//right
            var rect = null;
            var dx = 0;
            if(dir == 0){
                rect = _sf.getCharactersRect(value,selfY,validWidth,validHeight);
                dx = _sf.isCanMoveLeftRight(rect.top , rect.bottom,rect.left,true,rect);
                _sf.CannotMoveX = dx != 0 ;
                selfX = value + dx;
            }else if(dir == 1){
                rect = _sf.getCharactersRect(value,selfY,validWidth,validHeight);
                dx = _sf.isCanMoveLeftRight(rect.top , rect.bottom,rect.right,false,rect);
                _sf.CannotMoveX = dx != 0;
                selfX = value - dx;
            }else if(dir == -1 && _sf.isActor){
                rect = _sf.getCharactersRect(value,selfY,validWidth,validHeight);
                dx = _sf.isCanMoveLeftRight(rect.top , rect.bottom,rect.left,true,rect);
                _sf.CannotMoveX = dx != 0;
                selfX = value + dx;
                if(Math.abs(dx) > RV.NowProject.blockSize){
                    _sf.isSandDie = true;
                    return;
                }
                rect = _sf.getCharactersRect(value,selfY,validWidth,validHeight);
                var tempdx = _sf.isCanMoveLeftRight(rect.top , rect.bottom,rect.right,false,rect);
                if(tempdx != 0){
                    _sf.CannotMoveX = tempdx != 0;
                    selfX = value - tempdx;
                    if(Math.abs(tempdx) > RV.NowProject.blockSize){
                        _sf.isSandDie = true;
                        return;
                    }
                }


                showX = selfX + ( RV.NowProject.blockSize / 2);
                CorrectedPosition(showX,showY);
            }else if(!_sf.isActor){
                _sf.CannotMoveX = false;
            }
            if(dir != -1){
                showX = selfX + ( RV.NowProject.blockSize / 2);
                CorrectedPosition(showX,showY);
            }
        }
    });

    /**
     * set Y of character
     */
    Object.defineProperty(this, "y", {
        get: function () {
            return selfY
        },
        set: function (value) {
            _sf.CannotMoveY = true;
            var dir = -1;
            if(value > selfY) dir = 2; //down
            if(value < selfY) dir = 3; //up
            var rect = null;
            var dy = 0;
            if(dir == 2){
                rect = _sf.getCharactersRect(selfX,value,validWidth,validHeight);
                dy = _sf.isCanMoveUpDown(rect.left,rect.right,rect.bottom,false,rect);
                _sf.CannotMoveY = dy != 0;
                selfY = value - dy;
            }else if(dir == 3){
                rect = _sf.getCharactersRect(selfX,value,validWidth,validHeight);
                dy = _sf.isCanMoveUpDown(rect.left,rect.right,rect.top,true,rect);
                _sf.CannotMoveY = dy != 0;
                selfY = value + dy;
            }else if(dir == -1 && _sf.isActor){
                rect = _sf.getCharactersRect(selfX,value,validWidth,validHeight);
                dy = _sf.isCanMoveUpDown(rect.left,rect.right,rect.bottom,false,rect);
                _sf.CannotMoveY = dy != 0;
                selfY = value - dy;
                if(Math.abs(dy) > RV.NowProject.blockSize){
                    _sf.isSandDie = true;
                    return;
                }
                if(dy == 0){
                    rect = _sf.getCharactersRect(selfX,value,validWidth,validHeight);
                    dy = _sf.isCanMoveUpDown(rect.left,rect.right,rect.top,true,rect);
                    _sf.CannotMoveY = dy != 0;
                    selfY = value + dy;
                    if(Math.abs(dy) > RV.NowProject.blockSize){
                        _sf.isSandDie = true;
                        return;
                    }
                }
                showY = (selfY - difHeight) + RV.NowProject.blockSize;
                CorrectedPosition(showX,showY);
            }else if(!_sf.isActor){
                _sf.CannotMoveY = false;
            }
            if(dir != -1){
                showY = (selfY - difHeight) + RV.NowProject.blockSize;
                CorrectedPosition(showX,showY);
            }
        }
    });

    var selfBlock = null;
    if(IVal.DEBUG && sprite != null){
        selfBlock = new ISprite(new IBitmap.CBitmap(RV.NowProject.blockSize,RV.NowProject.blockSize),view);
        selfBlock.drawRect(new IRect(0,0,selfBlock.width,selfBlock.height),new IColor(125,125,0,125));
        selfBlock.z = sprite.z - 1;
    }

    //==================================== Public Function ===================================

    /**
     * Force the character to a position
     * @param x
     * @param y
     */
    this.mustXY = function(x,y){
        selfX = x;
        selfY = y;
        resetShowXY();
        CorrectedPosition(showX,showY);
    };

    /**
     * Main update
     */
    this.updateBase = function(){

        //Update animation
        if(nowAction.length >= 1 && this.playAnim){
            if(animationWait <= 0){
                animationIndex += 1;
                if(animationIndex >=  nowAction.length && !isSingleTime){
                    animationIndex = 0;
                }else if(animationIndex >=  nowAction.length && isSingleTime){

                    if(isRestore){
                        isSingleTime = false;
                        _sf.setAction(oldAnimationIndex);
                    }else{
                        animationIndex = nowAction.length - 1;
                    }
                    if(_sf.actionCall != null){
                        _sf.actionCall();
                    }

                }
                var tempR = nowAction[animationIndex];
                nowCof.x = tempR.x;
                nowCof.y = tempR.y;
                nowCof.width = tempR.width;
                nowCof.height = tempR.height;
                //update Decision area
                if(!tempR.collisionRect.auto){
                    validWidth = tempR.collisionRect.width;
                    validHeight = tempR.collisionRect.height;
                    validX = tempR.collisionRect.x;
                    validY = tempR.collisionRect.y;
                }else{
                    _sf.resetValidSize();
                }
                //Attack callback
                if(tempR.points.length > 0 && this.shootCall != null){
                    this.shootCall(tempR.points);
                }
                if(tempR.effective && this.atkCall != null){
                    this.atkCall();
                }
                if(tempR.sound != "" && nowAction.length > 1){
                    RV.GameSet.playSE("Audio/" + tempR.sound,tempR.volume);
                }
                difHeight = nowAction[animationIndex].height / 2;
                resetShowXY();
                centerPoint(nowCof.width , nowCof.height,showX,showY);
                animationWait = tempR.time;
                CorrectedPosition(showX,showY);
            }else{
                animationWait -= (_sf.actionRate / 5);
                if(animationWait <= 0) animationWait = 0;
            }
        }
    };

    this.reSingleTime = function(){
        isSingleTime = false;
    };

    this.setInitData = function(m,b){
        mapData = m;
        blocks = b;
    };

    /**
     * Main Dispose
     */
    this.disposeBase = function(){
        if(sprite != null){
            sprite.disposeMin();
        }
        if(selfBlock != null){
            selfBlock.disposeMin();
        }
    };

    this.resetPublicBlock = function(){
        //reset Collision
        _sf.BlockBelow = null;
        _sf.BlockContact = null;
        _sf.InteractionBlockBelow = null;
        _sf.InteractionBlockContact = null;
    };

    /**
     * set direction of actor
     * @param isLeft
     */
    this.setLeftRight = function(isLeft){
        if(this.fixedOrientation) return;
        sprite.mirror = isLeft;
        resetShowXY();
        CorrectedPosition(showX,showY);
    };

    /**
     * Get ISprite of character
     * @returns {*}
     */
    this.getSpirte = function(){
        return sprite;
    };
    /**
     * Get IBof of current character
     * @returns {*}
     */
    this.getNowCof = function(){
        return nowCof;
    };

    this.getActionIndex = function(){
        return tempIndex;
    };

    this.haveActionIndex = function(index){
        return data.actionList[index] != null && data.actionList[index].length > 0;
    };

    /**
     * set action of character
     * principle——
     * 1、Please note that the standby action must be set
     * 2、If there is no action "walk" , it will change to standby.
     * 3、If there is no action "run" , it will change to walk.
     * 4、If there is no action "jump" , it will change to standby.
     * 5、If there is no action "land" , it will change to standby.
     * 6、If there is no action "squat" , it will change to standby.
     * 7、If there is no action "attack" , it will change to standby.
     * 8、If there is no action "jump attack" , it will change to attack.
     * 9、If there is no action "squat attack" , it will change to attack.
     * 10、If there is no action , it will change to standby.
     * 11、If there is no action "standby" , it will end the action.
     * @param index | Finding Action Index, 0 Standby 1 Walking 2 Running 3 Attack 4 Moving Shooting 5 Injury 6 Death 7 and Above
     * @param isReviseSize | Whether to correct the decision area
     * @param isSingle | Whether the action is played only once
     * @param isRestoreAction | Whether to restore after the action is finished
     * @param isMust | Force to change action
     */
    this.setAction = function(index,isReviseSize,isSingle,isRestoreAction,isMust){
        if(index >= data.actionList.length){
            log("Action switch failed: the setting action does not exist");
            return;
        }
        var must = isMust == null ? false : isMust;
        if(must){
            isSingleTime = false;
        }
        if(this.fixedAction || isSingleTime) return;
        if(tempIndex != index){

            var tempAction  = data.actionList[index];
            if(tempAction == null || tempAction.length <= 0){
                if(index == 0) return;
                var newIndex = 0;
                if(index == 4) newIndex = 3;
                if(index == 7) newIndex = 6;
                if(index == 8) newIndex = 6;
                if(index == 11) newIndex = 6;
                _sf.setAction(newIndex , isReviseSize,isSingle,isRestoreAction);
                return;
            }
            isSingleTime = isSingle == null ? false : isSingle;
            isRestore = isRestoreAction == null ? false : isRestoreAction;
            oldAnimationIndex = tempIndex;
            nowAction = data.actionList[index];
            var tempR = nowAction[0];
            animationWait = tempR.time;
            tempIndex = index;
            animationIndex = 0;
            nowCof = cofs[index];
            nowCof.x = tempR.x;
            nowCof.y = tempR.y;
            nowCof.width = tempR.width;
            nowCof.height = tempR.height;
            //SE of single frame animation is only played once
            if(tempR.sound != "" && nowAction.length == 1){
                RV.GameSet.playSE("Audio/" + tempR.sound,tempR.volume);
            }
            if(tempR.points.length > 0 && this.shootCall != null){
                this.shootCall(tempR.points);
            }
            if(tempR.effective && this.atkCall != null){
                this.atkCall();
            }
            sprite.setBCof(nowCof);
            difHeight = nowAction[0].height / 2;
            resetShowXY();
            centerPoint(nowCof.width , nowCof.height,showX,showY);
            CorrectedPosition(showX,showY);
            if(isReviseSize){
                if(!tempR.collisionRect.auto){
                    validWidth = tempR.collisionRect.width;
                    validHeight = tempR.collisionRect.height;
                    validX = tempR.collisionRect.x;
                    validY = tempR.collisionRect.y;
                }else{
                    _sf.resetValidSize();
                }
            }
        }
    };

    /**
     * reset decision area
     */
    this.resetValidSize = function(){
        validWidth = Math.max(Math.floor(data.actionList[0][0].width / RV.NowProject.blockSize),1) * RV.NowProject.blockSize - 15;
        validHeight = data.actionList[0][0].height;
        validX = 0;
        validY = 0;
    };

    /**
     * Get decision size of an action
     * @param index | id of action  0 Standby 1 Jump 2 Landing 3 Walk 4 Run 5 Squat 6 Attack 7 Jump Attack 8 Squat Attack 9-17 Other Animations
     * @returns {Array} return array of size 0width 1height
     */
    this.getValidSize = function(index){
        var tempAction = data.actionList[index];
        if(tempAction == null || tempAction.length <= 0){
            if(index == 0) return [0,0];
            var newIndex = 0;
            if(index == 4) newIndex = 3;
            if(index == 7) newIndex = 6;
            if(index == 8) newIndex = 6;
            return _sf.getValidSize(newIndex);
        }
        if(data.actionList[index].length > 0){
            return [
                Math.max(Math.floor(data.actionList[index][0].width / RV.NowProject.blockSize),1) * RV.NowProject.blockSize - 15,
                data.actionList[index][0].height]
        }
        return [0,0];
    };

    function makeRectDatum(rectA , rectB , datum , dir){
        if(dir == 0 || dir == 1){//up and down
            if(rectA.bottom >= rectB.top && rectA.top < rectB.top && Math.abs(rectA.left - rectB.right) >= 5 &&  Math.abs(rectA.right - rectB.left) >= 5 ){
                if(dir == 0){
                    return rectA.bottom - datum;
                }else{
                    return -(rectA.bottom - (datum - rectB.height));
                }

            }else if(rectA.top <= rectB.bottom && rectA.bottom > rectB.bottom && Math.abs(rectA.left - rectB.right) >= 5 &&  Math.abs(rectA.right - rectB.left) >= 5 ){
                if(dir == 0){
                    return -((datum + rectB.height) - rectA.top);
                }else{
                    return datum - rectA.top;
                }
            }else{
                return 0;
            }
        }else if(dir == 2 || dir == 3){//left and right
            if(rectA.right >= rectB.left && rectA.left < rectB.left &&  Math.abs(rectA.top - rectB.bottom) >= 5 &&  Math.abs(rectA.bottom - rectB.top) >= 5){
                if(dir == 2){
                    return (rectA.right - datum);
                }else{
                    return (rectA.right - (datum - rectB.width)) * -1;
                }

            }else if(rectA.left <= rectB.right && rectA.right > rectB.right &&  Math.abs(rectA.top - rectB.bottom) >= 5 &&  Math.abs(rectA.bottom - rectB.top) >= 5){
                if(dir == 2){
                    return ((datum + rectB.width) - rectA.left) * -1;
                }else{
                    return (datum - rectA.left);
                }
            }else{
                return 0;
            }
        }
    }

    /**
     * practicability of move up and down
     * @param startX | initial X
     * @param endX | end X
     * @param datumY | standard Y
     * @param isUp | up or not
     * @param rect | Decision rectangle
     * @returns {number} | offset
     */
    this.isCanMoveUpDown = function(startX,endX,datumY,isUp,rect){
        if(_sf.CanPenetrate) {  return 0; }
        _sf.isSandDie = false;
        var bY = parseInt(datumY / RV.NowProject.blockSize);
        var bX1 = parseInt(((startX + 1) / RV.NowProject.blockSize));
        var bX2 = parseInt(((endX - 1) / RV.NowProject.blockSize));

        //whether the up and down movement is out of the screen
        if(this.actor != null && !this.actor.IsGravity){
            if(isUp && datumY <= 0){
                return  datumY * -1;
            }else if(!isUp && datumY >= mapData[0].length * RV.NowProject.blockSize){
                return datumY - mapData[0].length * RV.NowProject.blockSize;
            }
        }
        if(bY < 0 || bY > mapData[0].length - 1 || bX1 < 0 || bX2 > mapData.length - 1) return 0;

        if(rect !=  null){

            var newRect = new IRect(rect.left + 1,rect.top + 1,rect.right - 1,rect.bottom);
            if(isUp){
                newRect.bottom -= 1;
            }
            var dy = 0;
            var tempInteractionBlocks = _sf.isHaveInteractionBlock(newRect);
            if(tempInteractionBlocks != null){
                for(i = 0;i<tempInteractionBlocks.length;i++){
                    var tempInteractionBlock = tempInteractionBlocks[i];
                    var tempRect = tempInteractionBlock.getRect();
                    if(isUp){
                        dy = makeRectDatum(tempRect,newRect,datumY,0);
                    }else{
                        dy = makeRectDatum(tempRect,newRect,datumY,1);
                    }
                    if(dy != 0) {
                        _sf.InteractionBlockContact = tempInteractionBlock;
                        if(!isUp){
                            _sf.InteractionBlockBelow = tempInteractionBlock;
                        }
                        return dy;
                    }
                }

            }

            var tempTriggers = _sf.collisionTrigger(newRect);
            for(i = 0;i<tempTriggers.length;i++){
                var tempTrigger = tempTriggers[i];
                if(isUp){
                    dy = makeRectDatum(tempTrigger,newRect,datumY,0);
                }else{
                    dy = makeRectDatum(tempTrigger,newRect,datumY,1);
                }
                if(dy != 0) return dy;
            }

            var tempEnemys = _sf.collisionEnemy(newRect);
            for(i = 0;i<tempEnemys.length;i++){
                var tempEnemy = tempEnemys[i];
                if(isUp){
                    dy = makeRectDatum(tempEnemy,newRect,datumY,0);
                }else{
                    dy = makeRectDatum(tempEnemy,newRect,datumY,1);
                }
                if(dy != 0) return dy;
            }
        }
        for(var i = bX1 ; i <= bX2 ; i++){
            if(mapData[i][bY] >= 0 ){
                if(isUp && mapData[i][bY] < 2000){
                    _sf.BlockContact = mapData[i][bY];
                    if(mapData[i][bY] == 4){
                        return 0;
                    }
                    return ((bY + 1) *RV.NowProject.blockSize) - datumY;
                }else if(!isUp && mapData[i][bY] < 2000){
                    _sf.BlockBelow = mapData[i][bY];
                    return datumY - (bY * RV.NowProject.blockSize);
                }
            }
        }
        //Swamp Block
        if(_sf.getSpirte().mirror && bX1 < mapData.length && bX2 <  mapData.length ){
            bX1 = parseInt(Math.round((startX + 1) / RV.NowProject.blockSize));
            bX2 = parseInt(Math.round((endX - 1) / RV.NowProject.blockSize));
            if(bX1 >= mapData.length){
                bX1 = mapData.length - 1;
            }
            if(bX2 >= mapData.length){
                bX2 = mapData.length - 1;
            }
        }
        for(i = bX1 ; i <= bX2 ; i++){
            if(mapData[i][bY] >= 2000){
                if(isUp){
                    _sf.BlockContact = mapData[i][bY];
                }else{
                    _sf.BlockBelow = mapData[i][bY];
                }
                return 0;
            }
        }

        return 0;
    };

    /**
     * practicability of move left and right
     * @param startY initial Y
     * @param endY end Y
     * @param datumX standard X
     * @param isLeft left or not
     * @param rect Decision rectangle
     * @returns {number} offset
     */
    this.isCanMoveLeftRight = function(startY,endY,datumX,isLeft,rect){
        if(_sf.isActor && RV.NowMap.viewMove){
            if(isLeft && datumX <= Math.abs(view.ox)){
                return Math.abs(view.ox) -datumX ;
            }else if(!isLeft && datumX >= Math.abs(view.ox) + view.width){
                return datumX - (Math.abs(view.ox) + view.width);
            }
    }
        if(_sf.CanPenetrate) { return  0; }
        _sf.isSandDie = false;
        var bX = parseInt(  datumX / RV.NowProject.blockSize);
        var bY1 = parseInt((startY + 1) / RV.NowProject.blockSize);
        var bY2 = parseInt((endY - 1) / RV.NowProject.blockSize);

        //whether the left and right movement is out of the screen
        if(isLeft && datumX <= 0){
            return  datumX * -1;
        }else if(!isLeft && datumX >= mapData.length * RV.NowProject.blockSize){
            return datumX - mapData.length * RV.NowProject.blockSize;
        }
        if(bX < 0){
            return datumX * -1;
        }
        if(bX > mapData.length - 1){
            return datumX - mapData.length * RV.NowProject.blockSize;
        }
        if(bY1 < 0 || bY2 > mapData[0].length - 1) return 0;
        if(bY1 > 0 && mapData[bX][bY1 - 1] >= 3000 && mapData[bX][bY1] >= 3000){
            _sf.isSandDie = true;
        }
        if(rect != null){
            var newRect = new IRect(rect.left + 1,rect.top + 1,rect.right - 1,rect.bottom - 1);

            var dx = 0;
            var tempInteractionBlocks = _sf.isHaveInteractionBlock(newRect);
            if(tempInteractionBlocks != null){
                for(i = 0;i<tempInteractionBlocks.length;i++){
                    var tempInteractionBlock = tempInteractionBlocks[i];
                    var tempRect = tempInteractionBlock.getRect();
                    if(isLeft ){
                        dx = makeRectDatum(tempRect,newRect,datumX,2);
                    }else{
                        dx = makeRectDatum(tempRect,newRect,datumX,3);
                    }
                    if(dx != 0) {
                        _sf.InteractionBlockContact = tempInteractionBlock;
                        return dx;
                    }
                }
            }

            var tempTriggers = _sf.collisionTrigger(newRect);
            for(i = 0;i<tempTriggers.length;i++){
                var tempTrigger = tempTriggers[i];
                if(isLeft ){
                    dx = makeRectDatum(tempTrigger,newRect,datumX,2);
                }else{
                    dx = makeRectDatum(tempTrigger,newRect,datumX,3);
                }
                if(dx != 0) return dx;
            }

            var tempEnemys = _sf.collisionEnemy(newRect);
            for(i = 0;i<tempEnemys.length;i++){
                var tempEnemy = tempEnemys[i];
                if(isLeft ){
                    dx = makeRectDatum(tempEnemy,newRect,datumX,2);
                }else{
                    dx = makeRectDatum(tempEnemy,newRect,datumX,3);
                }
                if(dx != 0) return dx;
            }

        }
        for(var i = bY1; i <= bY2 ; i++){
            if(mapData[bX][i] >= 0){
                if(mapData[bX][i] >= 0){
                    _sf.BlockContact = mapData[bX][i];
                }
                if(mapData[bX][i] >= 2000){
                    return 0;
                }
                if(mapData[bX][i] == 4){
                    return 0;
                }
                if(isLeft){
                    return ((bX + 1) * RV.NowProject.blockSize) - datumX;
                }else{
                    return datumX - (bX * RV.NowProject.blockSize);
                }
            }
        }
        return 0;
    };

    /**
     * Get decision area of current image
     * @param x | supposed selfX，or selfX default selfX
     * @param y | supposed selfY，or selfY default selfY
     * @param vw | Decision width, default validWidth
     * @param vh | Decision height, default validHeight
     * @returns {IRect} | rectangle
     */
     this.getCharactersRect = function(x,y,vw,vh){
         if(x == null) x = selfX;
         if(y == null) y = selfY;
         if(vw == null) vw = validWidth;
         if(vh == null) vh = validHeight;

         var xx = x + ( RV.NowProject.blockSize - vw) / 2 + validX;
         var yy = y + RV.NowProject.blockSize - vh + validY;
        validRect.left = xx;
        validRect.top = yy;
        validRect.right = xx + vw;
        validRect.bottom = yy + vh;
        return validRect;
    };

    /**
     * Get rectangle of Collision Object
     * @param rect
     * @returns {*}
     */
    this.isContactFortRect = function(rect){
        var rect1 = _sf.getCharactersRect();
        return rect1.intersects(rect);
    };


    /**
     * Get ShowX and ShowY
     * @returns {*[]}
     */
    this.getShowPoint = function(){
        return [showX,showY];
    };

    /**
     * define the type of interactive block
     * @param rect | Decision rectangle
     * @returns array[];
     */
    this.isHaveInteractionBlock = function(rect){
        if(blocks == null) return null;
        tempList.length = 0;
        for(var i = 0;i<blocks.length;i++){
            if(blocks[i].getData().isItem == false &&
                Math.abs(blocks[i].x - selfX) < validWidth * 2 &&  Math.abs(blocks[i].y - selfY) < validHeight * 2
                && blocks[i].isCollision(rect)){
                tempList.push(blocks[i]);
            }
        }
        return tempList;
    };

    /**
     * Collision with the trigger who owns the Collision Object
     * @param rect
     * @returns array[];
     */
    this.collisionTrigger = function(rect){
        var events = RV.NowMap.getEvents();
        tempList.length = 0;
        for(var i = 0 ; i < events.length ; i++){
            var char = events[i].getCharacter();
            if(char != null){
                var chars = char.getCharacter();
                if(events[i].entity && chars !== this &&
                    Math.abs(chars.x - selfX) < validWidth * 2 &&  Math.abs(chars.y - selfY) < validHeight * 2
                    && rect.intersects( events[i].getRect() )){
                    tempList.push(events[i].getRect());
                }
            }
        }
        return tempList;
    };

    /**
     * Collision with the enemy who owns the Collision Object
     * @param rect
     * @returns array[];
     */
    this.collisionEnemy = function(rect){
        var enemy = RV.NowMap.getEnemys();
        tempList.length = 0;
        for(var i = 0;i<enemy.length;i++){
            if(enemy[i].visible && !enemy[i].isDie && enemy[i].entity && enemy[i].getActor().getCharacter() !== this &&
                Math.abs(enemy[i].getActor().getCharacter().x - selfX) < validWidth * 2 &&
                Math.abs(enemy[i].getActor().getCharacter().y - selfY) < validHeight * 2
                && rect.intersects(enemy[i].getRect()) ){
                tempList.push(enemy[i].getRect());
            }
        }
        return tempList;
    };


    /**
     * Get interactive blocks
     * @returns {*}
     */
    this.getInteractionBlocks = function(){
        return blocks;
    };

    /**
     * change image of character
     * @param rActor
     */
    this.changeImage = function(rActor){
        data = rActor;
        cofs = [];
        for(var i = 0;i<data.actionList.length;i++){
            if(data.actionList[i].length > 0){
                var animation = data.actionList[i][0];
                cofs[i] = new IBCof(RF.LoadCache("Characters/" + data.file + data.actionName[i]) , animation.x,animation.y,animation.width,animation.height);
            }else{
                cofs[i] = null;
            }
        }

        if(cofs[0] != null){
            nowAction = data.actionList[0];
            nowCof = cofs[0];
            //calculated the height of the image above the ground
            difHeight = nowAction[0].height / 2;
            validWidth = Math.max(Math.floor(nowAction[0].width / RV.NowProject.blockSize),1) * RV.NowProject.blockSize - 15;
            validHeight = nowAction[0].height;

            if(sprite != null){
                sprite.setBCof(cofs[0]);
            }else{
                sprite = new ISprite(cofs[0],view);
            }

            sprite.z =z;
            //key frame animation
            animationWait = nowAction[0].time;
            animationIndex = -1;
        }
        resetShowXY();

    };

    this.correctShowPosition = function(){
        CorrectedPosition(showX,showY);
    };
    /**
     * get the decision base point
     * @returns {*}
     */
    this.getCenterPoint = function(){
        if(nowCof == null) return [0,0];
        var index = animationIndex;
        if(index < 0) index = 0;
        return [showX,(sprite.y - nowAction[index].dy) + sprite.height];
    };
    //==================================== Private Function ===================================
    /**
     * find center point xy
     * @return array
     */
    function centerPoint( w,  h,  x,  y) {
        var ax = x - (w / 2);
        var ay = y - (h / 2);
        return [ax,ay];
    }
    /**
     * Coordinate correction
     * @param x | X need to be corrected
     * @param y | Y need to be corrected
     */
    function CorrectedPosition(x , y ){
        if(sprite != null){
            var index = animationIndex;
            if(index < 0) index = 0;
            var p = centerPoint(nowCof.width , nowCof.height,x,y);
            if(sprite.mirror){
                sprite.x = p[0] - nowAction[index].dx;
            }else{
                sprite.x = p[0] + nowAction[index].dx;
            }
            sprite.y = p[1] + nowAction[index].dy;

        }
        if(selfBlock != null){
            selfBlock.x = Math.round(selfX / RV.NowProject.blockSize) * RV.NowProject.blockSize;
            selfBlock.y = Math.round(selfY / RV.NowProject.blockSize) * RV.NowProject.blockSize;
        }
    }

    /**
     * Reset ShowXY
     */
    function resetShowXY(){
        showX = selfX + ( RV.NowProject.blockSize / 2);
        showY = (selfY - difHeight) + RV.NowProject.blockSize;
    }

}/**
 * Created by Yitian Chen on 2018/7/19.
 * Logic of Show Choices
 */
function LChoice(){
    var _sf = this;
    //index of the Selected choices
    this.index = -1;
    //end or not
    this.isW = false;
    //sprites of choices
    this.bList = [];
    //end callback
    this.end = null;

    //images of choices
    var bitmapM,bitmapB;
    //close or not
    var isClose;
    bitmapM = RF.LoadBitmap("System/DialogBox/choice-0.png");
    bitmapB = RF.LoadBitmap("System/DialogBox/choice-1.png");

    var nowIndex = 0;
    var tempIndex = -1;
    /**
     * load choices
     * @param list | choices array
     * @param z | layer z
     */
    this.setupChoice = function(list,z) {

        _sf.dispose();

        if(list == null || list.length <= 0) return;
        var index = 0;
        for (var i = 0; i < list.length; i++) {
            var choice = RF.MakerValueText(list[i]);
            var temp = RF.TextAnalysisNull(choice);
            var bt = new IButton(bitmapB,bitmapM," ",null,false);

            var w = IFont.getWidth(temp, 16);
            var h = IFont.getHeight(temp, 16);
            bt.drawTitle(RF.C0().TColor() + "\\s[16]" + choice , (bitmapB.width - w) / 2 , (bitmapB.height - h) / 2);
            bt.z = z + 2;
            bt.x = (RV.NowProject.gameWidth - bt.width) / 2;
            bt.y = 120 + i * 70;
            bt.setOpactiy(0);
            bt.fadeTo(1,20);
            _sf.bList.push(bt);
        }

        _sf.index = -1;
        this.isW = true;
        isClose = false;

        nowIndex = 0;
        updateIndex();
    };

    function updateIndex(){
        if(nowIndex == tempIndex) return;
        tempIndex = nowIndex;
        for (var i = 0; i < _sf.bList.length; i++) {
            if(nowIndex == i){
                _sf.bList[i].setBitmap(bitmapM,bitmapB,false);
            }else{
                _sf.bList[i].setBitmap(bitmapB,bitmapM,false);
            }
        }
    }

    /**
     * Main update
     */
    this.update = function(){
        if(!this.isW) return;
        //mouse
        for (var i = 0; i < this.bList.length; i++) {
            var bt = this.bList[i];
            if(bt == null ) continue;
            if(bt.isClick()){
                _sf.index = i;
                _sf.closeChoice();
                if(_sf.end != null){
                    _sf.end(_sf.index);
                }
                return;
            }
            if(bt.getBack().isSelectTouch() == 1){
                nowIndex = i;
                updateIndex()
            }
        }
        //keyboard
        if(IInput.isKeyDown(RC.Key.down) || IInput.isKeyDown(40)){//down
            nowIndex += 1;
            if(nowIndex >= this.bList.length) nowIndex = 0;
            updateIndex();
        }
        if(IInput.isKeyDown(RC.Key.up) || IInput.isKeyDown(38)){//up
            nowIndex -= 1;
            if(nowIndex < 0) nowIndex = this.bList.length - 1;
            updateIndex();
        }
        if(IInput.isKeyDown(RC.Key.ok) || IInput.isKeyDown(32) || IInput.isKeyDown(108) || IInput(13)){
            _sf.index = nowIndex;
            _sf.closeChoice();
            if(_sf.end != null){
                _sf.end(_sf.index);
            }
        }

    };
    /**
     * close choices
     */
    this.closeChoice = function(){
        for (var i = 0; i < this.bList.length; i++) {
            var bt = this.bList[i];
            if(bt == null ) continue;
            bt.fadeTo(0,10);
        }
        _sf.isW = false;
        isClose = true;
    };

    /**
     * Dispose
     */
    this.dispose = function(){
        if(_sf.bList != null){
            for (var i = 0; i < this.bList.length; i++) {
                var bt = this.bList[i];
                if(bt == null ) continue;
                bt.disposeMin();
            }
            _sf.bList = [];
        }

    };



}/**
 * Created by Yitian Chen on 2019/1/9.
 * Logic of Decoration
 * @param resDecorate decoration resource
 * @param viewport | viewport
 * @param maxWidth | max width of map
 * @param maxHeight | max height of map
 * @param x | initial X
 * @param y | initial X
 * @param z | layer z
 * @constructor
 */
function LDecorate(resDecorate,viewport,maxWidth,maxHeight,x,y,z){
    var data = resDecorate;
    //movement effect
    var moveType = data.type;//0none 1bln 2left to right 3right to left 4bottom to top 5top to bottom
    var moveSpeed = data.time;
    var moveDif = 0;
    var moveWait = 0;
    var moveNowWaite = 0;
    //Calculate frequency
    if(moveSpeed <= 10){
        moveDif = 11 - moveSpeed;
        moveWait = 0;
    }else{
        moveDif = 1;
        moveWait = 10 - moveSpeed;
    }

    //key frame animation
    var animWait = data.anim[0].time;
    var animIndex = 0;
    //Generate drawing sprites
    var cof = new IBCof(RF.LoadCache("Decorate/" + data.file) , data.anim[0].x, data.anim[0].y, data.anim[0].width, data.anim[0].height);
    var sprite = new ISprite(cof , viewport);
    sprite.z = z;
    //Calculate starting x, y coordinates
    var tx = x * RV.NowProject.blockSize;
    tx = tx - (data.anim[0].width - RV.NowProject.blockSize) / 2;
    var ty = (y + 1) * RV.NowProject.blockSize;
    ty = ty - data.anim[0].height;
    sprite.x = tx;
    sprite.y = ty;

    //BLN
    if(moveType == 1){
        sprite.addAction(action.fade,1,0,moveSpeed);
        sprite.addAction(action.wait,moveSpeed);
        sprite.addAction(action.fade,0,1,moveSpeed);
        sprite.actionLoop = true;
    }

    //update
    this.update = function(){
        //Update animation
        if(data.anim.length > 1){
            if(animWait == 0){
                animIndex += 1;
                if(animIndex >=  data.anim.length){
                    animIndex = 0;
                }
                var tempR = data.anim[animIndex];
                cof.x = tempR.x;
                cof.y = tempR.y;
                cof.width = tempR.width;
                cof.height = tempR.height;
                animWait = tempR.time;
            }else{
                animWait -= 1;
            }
        }

        //update effect
        if(moveNowWaite == 0){
            if(moveType == 2){ //move from left to right
                sprite.x += moveDif;
                if(sprite.x >= maxWidth){
                    sprite.x = 0 - sprite.width;
                }
            }else if(moveType == 3){//move from right to left
                sprite.x -= moveDif;
                if(sprite.x <= 0 - sprite.width){
                    sprite.x = maxWidth;
                }
            }else if(moveType == 4){//move from bottom to top
                sprite.y -= moveDif;
                if(sprite.y <= 0 - sprite.height){
                    sprite.y = maxHeight;
                }
            }else if(moveType == 5){//move from top to bottom
                sprite.y += moveDif;
                if(sprite.y >= maxHeight){
                    sprite.y = 0 - sprite.height;
                }
            }
        }else{
            moveNowWaite -= 1;
        }

    };

    //Dispose
    this.dispose = function(){
        sprite.disposeMin();
    };

}/**
 * Created by Yitian Chen on 2019/3/16.
 * Logic of enemy
 * @param enemy | enemy configuration data
 * @param view | viewport
 * @param mdata | data of blocks
 * @param blocks | data of interactive blocks
 * @param mapdata | map data
 */
function LEnemy(enemy , view , mdata , blocks , mapdata){

    var _sf = this;

    var data = enemy;
    var cof = RV.NowSet.findEnemyId(enemy.eid);

    //set parameter of enemy
    this.hp = cof.maxHp;
    this.mp = cof.maxMp;
    this.entity = cof.isEntity;
    this.sumHp = 0;
    this.visible = data.isVisible;
    this.activity = data.isActivity;

    //CD of enemyAI
    var isInjured = false;
    var actionWait = 0;
    var skilling = false;
    var hpBar = new IScrollbar(RF.LoadCache("System/bar-enemy-hp_0.png") , RF.LoadCache("System/bar-enemy-hp_1.png") , 0,cof.maxHp , view);
    hpBar.z = cof.isPenetrate ? 245 : 185;
    hpBar.visible = false;

    //set basic attribute of Actor
    var char = new LActor(view , 0 , 0 , mdata , blocks , data.x * RV.NowProject.blockSize, data.y * RV.NowProject.blockSize, cof.picId , cof.isPenetrate ? 240 : 180);
    char.camp = 1;
    char.IsGravity = cof.moveType == 0;
    char.GravityNum = (RV.GameData.gravityNum / 100) * mapdata.gravity;
    char.IsCanPenetrate = cof.isPenetrate;
    char.getCharacter().CanPenetrate = cof.isPenetrate;
    char.baseSpeed = 1 + ((cof.moveSpeed - 1) * 0.5);
    char.atkType = cof.atkType - 1;
    char.bulletId = cof.atkBullet;
    char.atkDis = cof.atkDistance;
    char.atkWait = cof.atkTime;
    char.getCharacter().setLeftRight(enemy.dir == 1);

    //Death callback
    char.DieDo = function(){
        hpBar.visible = false;
        _sf.isDie = true;
        var anim = RV.NowRes.findResAnim(cof.dieAnimId);
        if(anim != null){
            RV.NowCanvas.playAnim(cof.dieAnimId,function(){
                settlement();
            },char,true);
        }else{
            settlement();
        }
        for(var i = 0;i<_sf.buff.length;i++){
            _sf.buff[i].dispose();
        }
    };

    //Injury callback
    char.InjuredDo = function(type,num){
        if(_sf.visible == false ) return;
        var tempHp = 0;
        var tempShow = 0;
        if(type == 0){//Fixed damage value
            tempHp = num;
        }else if(type == 1){//Percent damage
            tempHp = cof.maxHp * num;
        }else if(type == 2){//damage from actor
            //Damage calculation
            var obj = num;
            if(obj == null) return;
            if(obj.crit && obj.damage > 0){
                tempShow = 1;
            }
            if(!char.superArmor){
                //Knockback
                if(obj.dir == 1){
                    char.getCharacter().x -= obj.repel;
                }else{
                    char.getCharacter().x += obj.repel;
                }
                //Launcher
                char.getCharacter().y -= obj.fly;
            }

            tempHp = obj.damage;
            //actor suck blood
            RV.GameData.actor.hp += parseInt(tempHp * (RV.GameData.actor.getbloodSucking() / 100));

        }

        if(tempHp > 0){
            char.stiff(10);
            _sf.sumHp += tempHp;
            isInjured = true;
            if(char.nowSkill != null){
                if(char.nowSkill.stopSkill()){
                    char.nowSkill.update();
                    char.nowSkill = null;
                }

            }
        }
        new LNum(tempShow,tempHp,view,char.getCharacter().x,char.getCharacter().y);
        _sf.hp -= tempHp;
        hpBar.visible = true;
        hpBar.setValue(_sf.hp,cof.maxHp);
        hpBar.update();
        if(_sf.hp <= 0){
            char.deathDo();
        }
    };
    //Actions currently being processed
    var nowAction = null;

    //enemy index of map
    this.index = enemy.index;
    //buff array
    this.buff = [];
    //enemy is died or not
    this.isDie = false;

    //action limit
    this.LAtk = false;
    this.LSkill = false;
    this.LItem = false;
    this.LMove = false;
    this.LSquat = false;
    this.LJump = false;
    this.LOutOfCombat = false;

    //Filter parallel conditions
    var tempAction = cof.action.concat();
    var judgeList = [];
    while(true){
        if(tempAction.length <= 0){
            break;
        }
        var temp = tempAction[0];
        var isAdd = false;
        for(var j = 0;j<judgeList.length;j++){
            if(judgeList[j][0].rate == temp.rate && judgeList[j][0].nextTime == temp.nextTime && judgeList[j][0].actionType == temp.actionType &&
                ( (judgeList[j][0].actionType == 0 && judgeList[j][0].actionId == temp.actionId) ||
                (judgeList[j][0].actionType == 1 && judgeList[j][0].skillId == temp.skillId) )){
                judgeList[j].push(temp);
                isAdd = true;
                break;
            }
        }
        if(isAdd == false){
            judgeList.push([temp]);
        }
        tempAction.splice(0,1);

    }

    /**
     * Add items and experience after death
     */
    function settlement(){
        var trigger = RV.NowSet.findEventId(cof.evetId);
        if(trigger != null){
            trigger.doEvent();
        }
        RV.GameData.actor.exp += cof.exp;
        RV.GameData.money += cof.money;
        var items = [];
        //Ready to get items
        for(var i = 0;i<cof.items.length;i++){
            if(RF.ProbabilityHit(cof.items[i].rate / 100)){
                var item = new DBagItem(cof.items[i].type,cof.items[i].id);
                if(item.findData() != null){
                    items.push(item);
                }
            }
        }
        for(i = 0;i<items.length;i++){
            RV.GameData.addItem(items[i].type,items[i].id,1);
            var itemCof = items[i].findData();
            var icon = new ISprite(RF.LoadCache("Icon/" + itemCof.icon),view);
            icon.opacity = 0;
            icon.x = char.getCharacter().x;
            icon.y = char.getCharacter().y;
            icon.z = 500;
            icon.addAction(action.wait,20 * i);
            icon.addAction(action.move,icon.x,icon.y - 60,60);
            icon.addAction(action.fade,1,0,60);
            icon.setOnEndFade(function(sp){
                sp.disposeMin();
            });
        }
    }

    /**
     * Main update
     */
    this.update = function(){
        if(char == null) return;
        if(!_sf.isDie){
            char.getCharacter().getSpirte().visible = this.visible;
        }
        if(char.getCharacter().getSpirte().visible && char.getCharacter().getSpirte().opacity > 0 ) char.update();
        if(this.activity == false || this.visible == false || this.isDie) return;
        updateAction();
        updateBar();
        _sf.updateBuff();
        if(_sf.mp < 0) _sf.mp = 0;
        if(_sf.mp > this.getMaxMp()) _sf.mp = _sf.getMaxMp();
        if(_sf.hp > _sf.getMaxHP()) _sf.hp = _sf.getMaxHP();
    };

    /**
     * dispose
     */
    this.dispose = function(){
        char.dispose();
        hpBar.disposeMin();
        for(var i = 0;i<_sf.buff.length;i++){
            _sf.buff[i].dispose();
        }
        char = null;
    };

    this.updateGravityNum = function(){
        if(char == null) return;
        char.GravityNum = (RV.GameData.gravityNum / 100) * mapdata.gravity;
        char.Speed[0] = 0;
    };


    /**
     *get direction
     * @returns {number}
     */
    this.getDir = function(){
        return char.getDir();
    };

    /**
     * get object of LActor
     * @returns {LActor}
     */
    this.getActor = function(){
        return char;
    };

    /**
     * get max HP
     * @returns {*}
     */
    this.getMaxHP = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().maxHP;
        }
        return cof.maxHp + buffAdd;
    };

    /**
     * get max MP
     */
    this.getMaxMp = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().maxMP;
        }
        return cof.maxMp + buffAdd;
    };

    /**
     * get Attack
     * @returns {*}
     */
    this.getWAtk = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().watk;
        }
        return cof.WAtk + buffAdd;
    };

    /**
     * get Defence
     * @returns {*}
     */
    this.getWDef = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().wdef;
        }
        return cof.WDef + buffAdd;
    };

    /**
     * get M.Attack
     * @returns {*}
     */
    this.getMAtk = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().matk;
        }
        return cof.MAtk + buffAdd;
    };

    /**
     * get M.Defence
     * @returns {*}
     */
    this.getMDef = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().mdef;
        }
        return cof.MDef + buffAdd;
    };

    /**
     * Get Speed
     * @returns {*}
     */
    this.getSpeed = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().speed;
        }
        return cof.Speed + buffAdd;
    };

    /**
     * Get Luck
     * @returns {*}
     */
    this.getLuck = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().luck;
        }
        return cof.Luck + buffAdd;
    };

    /**
     * Get crit
     * @returns {number}
     */
    this.getAddCrit = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().crit;
        }
        return buffAdd;
    };

    /**
     * Get Critical Strength
     * @returns {number}
     */
    this.getAddCritF = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().critF;
        }
        return buffAdd;
    };

    /**
     * Get dodge
     * @returns {number}
     */
    this.getAddDodge = function(){
        var buffAdd = 0;
        for(var i = 0;i<_sf.buff.length;i++){
            buffAdd += _sf.buff[i].getData().dodge;
        }
        return buffAdd
    };

    /**
     * Get Knockback distance
     */
    this.getRepel = function(){
        return cof.atkRepel;
    };
    /**
     * Get enemy Configuration Data
     * @returns {DSetEnemy}
     */
    this.getData = function(){
        return cof;
    };
    /**
     * Get Decision rectangle
     * @returns {IRect}
     */
    this.getRect = function(){
        return char.getCharacter().getCharactersRect();
    };

    this.getCharacter = function(){
        return char.getCharacter();
    };

    /**
     * add BUFF
     * @param id | buffID
     */
    this.addBuff = function(id){
        if(_sf.isDie) return;
        var buffCof = RV.NowSet.findStateId(id);
        if(buffCof != null){
            var canAdd = true;
            if(!buffCof.cantResist && cof.defState[id] != null){
                canAdd = !RF.ProbabilityHit(cof.defState[id] / 100);
            }
            if(canAdd){
                var bf = new DBuff(buffCof,_sf);
                bf.endDo = function(){
                    _sf.buff.remove(bf);
                };
                _sf.buff.push(bf);
                //change buff
                for(var mid in buffCof.cState){
                    if(buffCof.cState[id] === 1){
                        _sf.addBuff(mid);
                    }else if(buffCof.cState[id] === 2){
                        _sf.subBuff(mid);
                    }
                }
            }

        }
    };

    this.getUserRect = function(){
        return char.getUserRect();
    };

    /**
     * remove BUFF
     * @param id buffID
     */
    this.subBuff = function(id){
        for(var i = _sf.buff.length - 1;i>=0;i--){
            if(_sf.buff[i].getData().id === id){
                _sf.buff[i].endDo = null;
                _sf.buff[i].overBuff();
                _sf.buff.remove(_sf.buff[i]);
            }
        }
    };

    /**
     * update buff
     */
    this.updateBuff = function(){
        for(var i = 0;i<_sf.buff.length;i++){
            _sf.buff[i].update();
        }
    };
    /**
     * find BUFF
     * @param id buffID
     * @returns {*}
     */
    this.findBuff = function(id){
        for(var i = 0;i < _sf.buff.length;i++){
            if(_sf.buff[i].getData().id === id){
                return _sf.buff[i];
            }
        }
        return null;
    };
    /**
     * save
     * @returns {{x, y, hp: *, mp: (*|number), visible: (boolean|*), activity: (boolean|*), isDie: (boolean|*)}}
     */
    this.save = function(){
        return {
            x:char.getCharacter().x,
            y:char.getCharacter().y,
            hp : _sf.hp,
            mp : _sf.mp,
            visible : _sf.visible,
            activity : _sf.activity,
            isDie:_sf.isDie,
            camp:char.camp
        }
    };

    /**
     * load
     * @param info
     */
    this.load = function(info){
        char.getCharacter().x = info.x;
        char.getCharacter().y = info.y;
        char.camp = info.camp;
        _sf.hp = info.hp;
        _sf.mp = info.mp;
        _sf.visible = info.visible;
        _sf.activity = info.activity;
        _sf.isDie = info.isDie;
        if(_sf.isDie){
            char.isDie = _sf.isDie;
            char.getCharacter().getSpirte().opacity = 0;
        }else{
            hpBar.visible = _sf.hp < cof.maxHp;
            hpBar.setValue(_sf.hp,cof.maxHp);
        }
    };

    /**
     * Get enemy elements
     * @returns {{def: number, atk: number}}
     */
    this.getAttribute = function(actor){
        var obj1 = null;
        var obj2 = null;
        if(actor == null){
            obj1 = RV.GameData.actor.getDefAttrbute(cof.attributeId);
            obj2 = RV.GameData.actor.getDefAttrbute(cof.otherAttributeId);
        }else{
            obj1 = actor.getDefAttrbute(cof.attributeId);
            obj2 = actor.getDefAttrbute(cof.otherAttributeId);
        }
        return {
            atk : obj1.atk + Math.abs(obj2.atk / 2),
            def : obj1.def + Math.abs(obj2.def / 2)
        }
    };

    this.getDefAttrbute = function(id){
        var eatt = RV.NowSet.findAttributeId(id);
        if(eatt == null) return {atk:1,def:0};
        var self1 = RV.NowSet.findAttributeId(cof.attributeId);
        if(self1 == null) return {atk:1,def:0};
        var self2 = RV.NowSet.findAttributeId(cof.otherAttributeId);
        if(self2 == null) return self1.getNum(eatt);
        var obj1 = self1.getNum(eatt);
        var obj2 = self2.getNum(eatt);
        return {
            atk : obj1.atk + Math.abs(obj2.atk / 2),
            def : obj1.def + Math.abs(obj2.def / 2)
        }
    };

    /**
     * update HP bar
     */
    function updateBar(){
        var sp = char.getCharacter().getCharactersRect();
        hpBar.x = sp.x + (sp.width - hpBar.width) / 2;
        hpBar.y = sp.y - hpBar.height - 10;
        hpBar.update();
    }

    /**
     * update action
     */
    function updateAction(){
        if(actionWait > 0){
            actionWait -= 1;
            return;
        }
        if(nowAction == null && !char.atking() && char.stiffTime <= 0 && !char.actionStart && !char.isDie && !skilling){
            if(cof.action.length < 0) return;
            nowAction = ActionSelect();
            if(nowAction != null){
                ActionDo(nowAction);
                nowAction = null;
            }
        }
    }

    /**
     * enemy Action processing
     * @param action | action
     * @constructor
     */
    function ActionDo(action){
        if(action.actionType === 0){//general action
            var events = [];
            var et = new DEvent(null);
            if(action.actionId === 0){//Do Nothing
                et.code = 201;
                et.args = [action.nextTime + ""];
            }else if(action.actionId === 1){//attack
                if(!_sf.LAtk) char.atk(_sf);
                et.code = 201;
                et.args = [cof.atkTime + ""];
                actionWait = cof.atkTime;
            }else if(action.actionId === 2 && !_sf.LMove){//retreat
                char.getCharacter().setLeftRight(char.getDir() == 0);
                char.getCharacter().fixedOrientation = true;
                et.code = 4101;
                et.args = ["6","1","0"];
            }else if(action.actionId === 3 && !_sf.LMove){//move
                char.getCharacter().fixedOrientation = false;
                if(cof.moveTarget === 1){//to actor
                    et.code = 4101;
                    et.args = ["5","1","0"];
                }else if(cof.moveTarget === 2 && !_sf.LMove){//patrol
                    var mx = Math.round(char.getCharacter().x / RV.NowProject.blockSize);
                    var my = Math.round(char.getCharacter().y / RV.NowProject.blockSize);
                    if(isTurnTo(mx,my,char.getDir())){
                        if(char.getDir() === 0){
                            char.moveLeft();
                        }else if(char.getDir() === 1){
                            char.moveRight();
                        }
                    }
                    et.code = 4101;
                    et.args = ["6",(RV.NowProject.blockSize / 2) + "","1"];
                }else if(cof.moveTarget === 3 && !_sf.LMove){//Random movement
                    et.code = 4101;
                    et.args = ["4","1","0"];
                }else if(cof.moveTarget === 4 && !_sf.LMove){//Forward
                    et.code = 4101;
                    et.args = ["6","1","0"];
                }

            }else if(action.actionId === 4 && !_sf.LMove){//jump
                char.getCharacter().fixedOrientation = false;
                et.code = 4102;
                if(char.getDir() == 0){
                    et.args = ["1","-1","0"];
                }else if(char.getDir() == 1){
                    et.args = ["-1","-1","0"];
                }

            }else if(action.actionId === 5 && !_sf.LMove){//Turn
                char.getCharacter().fixedOrientation = false;
                if(char.getDir() === 0){
                    char.moveLeft();
                }else if(char.getDir() === 1){
                    char.moveRight();
                }
            }else if(action.actionId === 6){//face to actor
                char.getCharacter().fixedOrientation = false;
                et.code = 4107;
                et.args = ["2","0","0"];
            }else if(action.actionId === 7 && !_sf.LAtk){//face to actor and attack
                char.getCharacter().fixedOrientation = false;
                char.getCharacter().setLeftRight(char.getCharacter().x > RV.NowMap.getActor().getCharacter().x);
                char.atk(_sf);
                et.code = 201;
                et.args = [cof.atkTime + ""];
                actionWait = cof.atkTime;
            }else if(action.actionId == 8 && char.camp == 2){
                var dis = 999999;
                var enemys = RV.NowMap.getEnemys();
                var tempEnemy = null;
                for(var i = 0;i<enemys.length;i++){
                    if(enemys[i] == _sf){
                        continue;
                    }
                    var tempRect = enemys[i].getActor().getUserRect();
                    //within scope
                    if(enemys[i].getActor().camp == 1 &&!enemys[i].isDie && enemys[i].visible){
                        //Calculate the distance between two points
                        var tempDis = Math.abs( Math.sqrt( Math.pow((char.getCharacter().x - tempRect.centerX),2) + Math.pow((char.getCharacter().y - tempRect.centerY),2) ) );
                        if(tempDis < dis){
                            dis = tempDis;
                            tempEnemy = RV.NowMap.getEnemys()[i];
                        }

                    }
                }
                if(tempEnemy != null){
                    char.getCharacter().setLeftRight(char.getCharacter().x > tempEnemy.getCharacter().x);
                }
            }else if(action.actionId == 9 && char.camp == 2 && !_sf.LAtk){
                dis = 999999;
                enemys = RV.NowMap.getEnemys();
                tempEnemy = null;
                for(i = 0;i<enemys.length;i++){
                    if(enemys[i] == _sf){
                        continue;
                    }
                    tempRect = enemys[i].getActor().getUserRect();
                    //within scope
                    if(enemys[i].getActor().camp == 1 &&!enemys[i].isDie && enemys[i].visible){
                        //Calculate the distance between two points
                        tempDis = Math.abs( Math.sqrt( Math.pow((char.getCharacter().x - tempRect.centerX),2) + Math.pow((char.getCharacter().y - tempRect.centerY),2) ) );
                        if(tempDis < dis){
                            dis = tempDis;
                            tempEnemy = RV.NowMap.getEnemys()[i];
                        }
                    }
                }
                if(tempEnemy != null){
                    char.getCharacter().setLeftRight(char.getCharacter().x > tempEnemy.getCharacter().x);
                }
                char.atk(_sf);
                et.code = 201;
                et.args = [cof.atkTime + ""];
                actionWait = cof.atkTime;
            }
            if(et.code > 0){
                events.push(et);
                char.setAction(events,true,false);
            }

        }else if(action.actionType === 1){//does skill
            skilling = true;
            RV.NowCanvas.playSkill(char , action.skillId , _sf,function(){
                skilling = false;
                et = new DEvent(null);
                et.code = 201;
                et.args = [action.nextTime + ""];
                events = [];
                events.push(et);
                char.setAction(events,true,false);
            });

        }

    }

    /**
     * Whether to touch the wall
     * @param rect | current Decision area
     * @param dir | direction
     * @returns {boolean}
     */
    function isTurnTo(x,y,dir){
        if(dir === 0){//right
            if(x + 1 >= mdata.length){
                return true;
            }
            if(mdata[x + 1] != null && mdata[x + 1][y] != null && mdata[x + 1][y] >= 0){
                return true;
            }
            if(cof.moveType == 0 && mdata[x + 1] != null && mdata[x + 1][y + 1] != null && mdata[x + 1][y + 1] < 0){
                return true;
            }
            if(cof.moveType == 0 && mdata[x + 1] != null && mdata[x + 1][y + 1] != null && mdata[x + 1][y + 1] === 3){
                return true;
            }
        }else if(dir === 1){//left
            if(x - 1 < 0){
                return true;
            }
            if(mdata[x - 1] != null && mdata[x - 1][y] != null && mdata[x - 1][y] >= 0){
                return true;
            }
            if(cof.moveType == 0 && mdata[x - 1] != null && mdata[x - 1][y + 1] != null && mdata[x - 1][y + 1] < 0){
                return true;
            }
            if(cof.moveType == 0 && mdata[x - 1] != null && mdata[x - 1][y + 1] != null && mdata[x - 1][y + 1] === 3){
                return true;
            }
        }
    }

    function isInRect(type,userRect){
        var enemy = RV.NowMap.getEnemys();
        if(char.camp == 1){//camp
            if(type == 0){//Within Enemies' attack range
                if(RV.NowMap.getActor().getAtkRect().intersects(char.getCharacter().getCharactersRect())){
                    return true;
                }
                for(var i = 0; i < enemy.length ; i++){
                    if(enemy[i].getActor().camp == 2 && enemy[i].visible && !enemy[i].isDie && enemy[i].getActor().getAtkRect().intersects( char.getCharacter().getCharactersRect()  ) ){
                        return true;
                    }
                }
            }else if(type == 1){//Within our attack range
                if(char.getAtkRect().intersects(RV.NowMap.getActor().getCharacter().getCharactersRect())){
                    return true;
                }
                for(i = 0; i < enemy.length ; i++){
                    if(enemy[i].getActor().camp == 2 && enemy[i].visible  && !enemy[i].isDie && char.getAtkRect().intersects( enemy[i].getActor().getCharacter().getCharactersRect()  ) ){
                        return true;
                    }
                }

            }else if(type == 2){
                if(userRect.intersects(RV.NowMap.getActor().getCharacter().getCharactersRect())){
                    return true;
                }
                for(i = 0; i < enemy.length ; i++){
                    if(enemy[i].getActor().camp == 2 && enemy[i].visible  && !enemy[i].isDie && userRect.intersects( enemy[i].getActor().getCharacter().getCharactersRect()  ) ){
                        return true;
                    }
                }
            }
        }else if(char.camp == 2){//Friendly forces
            if(type == 0){
                for(i = 0; i < enemy.length ; i++){
                    if(enemy[i].getActor().camp == 1 && enemy[i].visible && !enemy[i].isDie && enemy[i].getActor().getAtkRect().intersects( char.getCharacter().getCharactersRect()  ) ){
                        return true;
                    }
                }
            }else if(type == 1){
                for(i = 0; i < enemy.length ; i++){
                    if(enemy[i].getActor().camp == 1 && enemy[i].visible && !enemy[i].isDie && char.getAtkRect().intersects( enemy[i].getActor().getCharacter().getCharactersRect()  ) ){
                        return true;
                    }
                }
            }else if(type == 2){
                for(i = 0; i < enemy.length ; i++){
                    if(enemy[i].getActor().camp == 1 && enemy[i].visible  && !enemy[i].isDie && userRect.intersects( enemy[i].getActor().getCharacter().getCharactersRect()  ) ){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * enemy AI selection
     * @returns {*}
     */
    function ActionSelect(){
        var canList = [];
        var maxRand = 0;
        //Add conditional commands


        for(var i = 0;i<judgeList.length;i++){
            var count = 0;
            for(var j = 0;j<judgeList[i].length;j++){
                if(judgeAction(judgeList[i][j])){
                    count += 1;
                }
            }
            if(count >= judgeList[i].length){
                char.reAction = true;
                canList.push(judgeList[i][0]);
                maxRand += judgeList[i][0].rate;
            }

        }
        if(canList.length <= 0) return null;
        //choose commands
        while(true){
            var now = RF.RandomChoose(canList);
            if(RF.ProbabilityHit(now.rate / maxRand)){
                return now;
            }
        }

    }

    function judgeAction(action){

        var x = char.getCharacter().x;
        var y = char.getCharacter().y;
        if(action.IfType === 0){
            return true
        }
        if(action.IfType === 1 ){
            if(action.IfNum2 == 0 && (_sf.hp <= cof.maxHp * (action.IfNum1 / 100))){
                return true
            }else if(action.IfNum2 != 0 && (_sf.hp >= cof.maxHp * (action.IfNum1 / 100))){
                return true;
            }
        }
        if(action.IfType === 2){
            if(action.IfNum2 == 0 && RV.GameData.actor.level <= action.IfNum2){
                return true;
            }else if(action.IfNum2 == 0 && RV.GameData.actor.level >= action.IfNum2){
                return true;
            }
        }
        if(action.IfType === 3 && RV.GameData.getValue(action.IfNum3,false)){
            return true;
        }
        if(action.IfType === 4 && isInRect(0,null)){
            return true;
        }
        if(action.IfType === 5 && isInRect(1,null)){
            return true;
        }
        if(action.IfType === 6){
            var userRect = new IRect(1,1,1,1);

            if(char.getDir() === 0){
                userRect.x = x + action.triggerX * RV.NowProject.blockSize;
                userRect.y = y + action.triggerY * RV.NowProject.blockSize;
                userRect.width = action.triggerWidth * RV.NowProject.blockSize;
                userRect.height = action.triggerHeight * RV.NowProject.blockSize;
            }else{
                userRect.right = x - (action.triggerX - 1) * RV.NowProject.blockSize;
                userRect.y = y + action.triggerY * RV.NowProject.blockSize;
                userRect.left = userRect.right - action.triggerWidth * RV.NowProject.blockSize;
                userRect.height = action.triggerHeight * RV.NowProject.blockSize;
            }
            if(isInRect(2,userRect)){
                return true;
            }

        }
        if(action.IfType === 8){//Encounter obstacles
            var mx = Math.round(x / RV.NowProject.blockSize);
            var my = Math.round(y / RV.NowProject.blockSize);
            if(isTurnTo(mx,my,char.getDir()) || char.getCharacter().CannotMoveX){
                return true;
            }
        }
        if(action.IfType === 9 && isInjured){//be attacked
            isInjured = false;
            return true;
        }
    }




}/**
 * Created by Yitian Chen on 2019/1/9.
 *  Logic of interactive Block
 * @param interactionBlock | configuration data
 * @param bd  | this block data in map
 * @param view | viewport
 * @param x | x-coordinate
 * @param y | y-coordinate
 * @param z | layer z
 * @param mdata | data of blocks
 * @param blocks | data of other interactive blocks
 * @param mapdata | map data
 * @param mark | location mark
 */
function LInteractionBlock(interactionBlock , bd , view , x , y , z , mdata , blocks,mapdata,mark){

    var _sf = this;

    var mapData = mdata;
    var data = interactionBlock;
    var blockData = bd;
    var resBlock = RV.NowRes.findResBlock(data.BlockId);

    var block = new LBlock(resBlock,blockData,view,x,y,data.isPenetrate ? 175 : z);

    var isEat = false;
    var doEnd = false;

    var nowPage = null;

    var pageIndex = -1;
    var tempPageIndex = -1;

    //Whether it was destroyed
    this.isDestroy = false;
    //move Speed
    this.speed = [0,0];

    //Whether it can move in the X direction
    this.CannotMoveX = false;
    //Whether it can move in the Y direction
    this.CannotMoveY = false;
    //gravity
    this.isGravity = data.isGravity;
    //Through
    this.isPenetrate = data.isPenetrate;
    if(mark != null){
        this.mark = mark;
    }else{
        this.mark = x + "," + y;
    }

    //External control related Variable movement
    this.actionStart = false;
    this.actionLock = false;

    var baseSpeed = 2;
    //movement
    var actionIgnore = false;
    var actionLoop = false;
    var actionMove = false;
    var actionList = [];
    var actionPos = -1;
    var nowAction = null;
    var actionWait = 0;
    var moveDir = -1;
    var moveDis = 0;


    var oldGravity = false;
    var oldSpeed = false;


    /**
     * set Y
     */
    Object.defineProperty(this, "y", {
        get: function () {
            return block.getSprite().y;
        },
        set: function (value) {
            _sf.CannotMoveY = true;
            var dir = -1;
            var sp = block.getSprite();
            if(value > sp.y) dir = 2; //down
            if(value < sp.y) dir = 3; //up
            var rect = null;
            var dy = 0;
            if(dir == 2){
                rect = new IRect(sp.x,value,sp.x + RV.NowProject.blockSize,value + RV.NowProject.blockSize);
                dy = _sf.isCanMoveUpDown(rect.left,rect.right,rect.bottom,false,rect);
                _sf.CannotMoveY = dy != 0;
                sp.y = value - dy;
            }else if(dir == 3){
                rect = new IRect(sp.x,value,sp.x + RV.NowProject.blockSize,value + RV.NowProject.blockSize);
                dy = _sf.isCanMoveUpDown(rect.left,rect.right,rect.top,true,rect);
                _sf.CannotMoveY = dy != 0;
                sp.y = value + dy;
            }
        }
    });

    /**
     * set X
     */
    Object.defineProperty(this, "x", {
        get: function () {
            return block.getSprite().x;
        },
        set: function (value) {
            _sf.CannotMoveX = true;
            var dir = -1;
            var sp = block.getSprite();
            if(value < sp.x) dir = 0;//left
            if(value > sp.x) dir = 1;//right
            var rect = null;
            var dx = 0;
            if(dir == 0){
                rect = new IRect(value,sp.y,value + RV.NowProject.blockSize,sp.y + RV.NowProject.blockSize);
                dx = _sf.isCanMoveLeftRight(rect.top , rect.bottom,rect.left,true,rect);
                _sf.CannotMoveX = dx != 0;
                sp.x = value + dx;
            }else if(dir == 1){
                rect = new IRect(value,sp.y,value + RV.NowProject.blockSize,sp.y + RV.NowProject.blockSize);
                dx = _sf.isCanMoveLeftRight(rect.top , rect.bottom,rect.right,false,rect);
                _sf.CannotMoveX = dx != 0;
                sp.x = value - dx;
            }


        }
    });

    /**
     * get data
     * @returns {*}
     */
    this.getData = function(){
        return data;
    };
    /**
     * Main update
     */
    this.update = function(){
        block.update();
        updateAction();
        updateEvent();
        if(data.isItem){
            if(!isEat && RV.NowMap.getActor().getCharacter().isContactFortRect(block.getRect())){
                eat();
            }
        }
        if(this.isGravity){
            this.speed[0] += (RV.GameData.gravityNum / 100) * mapdata.gravity;
            var sp = block.getSprite();
            this.y += this.speed[0];
        }
        if(this.CannotMoveX){
            _sf.speed[1] = 0;
        }
        if(this.CannotMoveY){
            _sf.speed[0] = 0;
        }
    };

    /**
     * disappear block
     */
    this.disappear = function(){
        var sp = block.getSprite();
        if(sp.isAnim()) return;
        sp.addAction(action.fade,1.0,0.5,20);
        sp.addAction(action.wait,20);
        sp.addAction(action.fade,0.5,1,20);
        sp.addAction(action.wait,20);
        sp.addAction(action.fade,1.0,0.5,20);
        sp.addAction(action.wait,20);
        sp.addAction(action.fade,0.5,1,20);
        sp.addAction(action.wait,20);
        sp.addAction(action.fade,1.0,0.0,30);
        sp.addAction(action.wait,300);
        sp.addAction(action.fade,0.0,1,20);
        sp.addAction(action.wait,20);
    };

    /**
     * Whether to collide with the rectangle
     * @param rect
     * @returns {boolean|*}
     */
    this.isCollision = function(rect){
        if(rect == null || this.isPenetrate){
            return false;
        }
        if(block.getSprite() != null && (block.getSprite().opacity <= 0 || !block.getSprite().visible)) return false;
        return rect.intersects(block.getRect());
    };

    /**
     * Trigger execution 
     * @param type | type
     */
    this.doEvent = function(type){
        if(nowPage != null && nowPage.type == type && !doEnd){
            if(nowPage.isParallel && RF.FindOtherEvent(_sf) == null ){
                RF.AddOtherEvent(nowPage.events , _sf , _sf.mark);
                doEnd = !nowPage.loop;
            }else if(!nowPage.isParallel && RV.InterpreterMain.isEnd){
                RV.InterpreterMain.addEvents(nowPage.events);
                RV.InterpreterMain.NowEventId = -1;
                doEnd = !nowPage.loop;
            }
        }
    };


    /**
     * get the trigger of  interactive blocks
     * @returns DTrigger
     */
    this.getTrigger = function(){
        return blockData.trigger;
    };

    /**
     * process triggers on interactive blocks
     */
    function updateEvent(){
        if(blockData.trigger == null || block.getSprite() != null && (block.getSprite().opacity <= 0 || !block.getSprite().visible)) return;
        var trigger = blockData.trigger;
        for(var i = trigger.page.length - 1;i >= 0;i--) {
            if(trigger.page[i].logic.tag == null){
                trigger.page[i].logic.tag = _sf;
            }
            if(i != tempPageIndex && trigger.page[i].logic.result()){
                pageIndex = i;
                tempPageIndex = pageIndex;
                nowPage = trigger.page[i];
                doEnd = false;
                return;
            }
            if(i == tempPageIndex && trigger.page[i].logic.result()){
                return;
            }
        }
        nowPage = null;
        doEnd = false;
    }

    /**
     * eat items block
     */
    function eat(){
        if(!data.isItem && isEat) return;
        isEat = true;
        if(data.isStatus){
            var rblock = RV.NowRes.findResBlock(data.BlockId2);
            if(rblock != null){
                block.changeBitmap(rblock);
            }else{
                block.getSprite().visible = false;
            }
        }else{
            block.getSprite().visible = false;
        }
        RV.GameData.money += data.money;
        if(data.hpValue != 0){
            RV.NowMap.getActor().injure(0 , -data.hpValue);
        }
        if(data.mpValue != 0){
            RV.NowMap.getActor().injure( 4 ,-data.mpValue);
        }
        RV.GameData.actor.addPow.maxHp += data.maxHpValue;
        RV.GameData.actor.addPow.maxMp += data.maxMpValue;
        RV.GameData.life += data.leftValue;
        RV.GameData.actor.addBuff();

        for(var id in data.cState){
            if(data.cState[id] == 1){
                RV.GameData.actor.addBuff(id);
            }else if(data.cState[id] == 2){
                RV.GameData.actor.subBuff(id);
            }
        }

        _sf.doEvent(6);


        RV.NowCanvas.playAnim(data.animId,null,_sf,true);
        RV.NowCanvas.playAnim(data.actorAnimId,null,RV.NowMap.getActor(),true);

        var trigger = RV.NowSet.findEventId(data.EventId);
        if(trigger != null){
            trigger.doEvent();
        }

    }

    /**
     * Destroy interactive block
     */
    this.destroy = function(){
        this.isDestroy = true;
        //Play destruction animation
        RV.NowCanvas.playAnim(data.animId,null,this,true);
        RV.NowCanvas.playAnim(data.actorAnimId,null,RV.NowMap.getActor(),true);

        //If there is a destruction pattern, switch the destruction pattern, else it will disappear
        if(data.isStatus){
            var rblock = RV.NowRes.findResBlock(data.BlockId2);
            if(rblock != null){
                block.changeBitmap(rblock);
            }else{
                block.getSprite().visible = false;
            }
        }else{
            block.getSprite().visible = false;
        }
        //If there are still internal blocks then the internal block is thrown
        if(blockData.inBlock != null){
            var sbi = RV.NowSet.findBlockId(blockData.inBlock.id);
            var minX = parseInt(Math.round(_sf.x / RV.NowProject.blockSize));
            var minY = parseInt(Math.round(_sf.y / RV.NowProject.blockSize));
            var lb = new LInteractionBlock(sbi,blockData.inBlock ,view , minX  , data.isStatus ? minY - 1 : minY , z , mdata , blocks,mapdata , "in"+_sf.mark );
            lb.update();
            if(lb.isGravity){
                lb.speed[0] = -5;
            }
            blocks.push(lb);
        }
        //Execute bind trigger
        _sf.doEvent(4);
        //Execute destroy common trigger
        var trigger = RV.NowSet.findEventId(data.EventId);
        if(trigger != null){
            trigger.doEvent();
        }
    };

    /**
     * Dispose
     */
    this.dispose = function(){
        block.dispose();
    };

    /**
     * Get rectangle
     * @returns {*}
     */
    this.getRect = function(){
        return block.getRect();
    };

    /**
     * practicability of move up and down
     * @param startX | initial X
     * @param endX | end X
     * @param datumY | standard Y
     * @param isUp | up or not
     * @param rect | Decision rectangle
     * @returns {number} | offset
     */
    this.isCanMoveUpDown = function(startX,endX,datumY,isUp,rect) {
        if (_sf.CanPenetrate) {
            return 0;
        }
        var bY = parseInt(datumY / RV.NowProject.blockSize);
        var bX1 = parseInt((startX + 1) / RV.NowProject.blockSize);
        var bX2 = parseInt((endX - 1) / RV.NowProject.blockSize);

        if (rect != null) {

            var newRect = new IRect(rect.left + 1, rect.top + 1, rect.right - 1, rect.bottom);

            var tempInteractionBlock = isHaveInteractionBlock(newRect);
            if (tempInteractionBlock != null) {
                _sf.InteractionBlockContact = tempInteractionBlock;
                if (!isUp) {
                    _sf.InteractionBlockBelow = tempInteractionBlock;
                }
                if (isUp) {
                    return tempInteractionBlock.getRect().bottom - datumY;
                } else {
                    return datumY - tempInteractionBlock.getRect().top;
                }
            }
        }
        for(var i = bX1 ; i <= bX2 ; i++){
            if(mapData[i][bY] >= 0 ){
                if(isUp){
                    return ((bY + 1) *RV.NowProject.blockSize) - datumY;
                }else{
                    return datumY - (bY * RV.NowProject.blockSize);
                }
            }
        }
        return 0;


    };

    /**
     * practicability of move left and right
     * @param startY | initial Y
     * @param endY | end Y
     * @param datumX | standard X
     * @param isLeft | left or not
     * @param rect | Decision rectangle
     * @returns {number} | offset
     */
    this.isCanMoveLeftRight = function(startY,endY,datumX,isLeft,rect){
        if(_sf.CanPenetrate) { return  0; }
        _sf.IsInSand = false;
        _sf.isSandDie = false;
        var bX = parseInt(datumX / RV.NowProject.blockSize);
        var bY1 = parseInt((startY + 1) / RV.NowProject.blockSize);
        var bY2 = parseInt((endY - 1) / RV.NowProject.blockSize);
        //Determine whether the left and right movement is out of the screen
        if(isLeft && datumX <= 0){
            return  datumX * -1;
        }else if(!isLeft && datumX >= mapData.length * RV.NowProject.blockSize){
            return datumX - mapData.length * RV.NowProject.blockSize;
        }

        if(bY1 > 0 && mapData[bX][bY1 - 1] >= 3000 && mapData[bX][bY1] >= 3000){
            _sf.isSandDie = true;
        }
        if(rect != null){
            var newRect = new IRect(rect.left + 1,rect.top + 1,rect.right - 1,rect.bottom - 1);

            var tempInteractionBlock = isHaveInteractionBlock(newRect);
            if(tempInteractionBlock != null){
                _sf.InteractionBlockContact = tempInteractionBlock;
                if(isLeft ){
                    return tempInteractionBlock.getRect().right - datumX;
                }else{
                    return datumX - tempInteractionBlock.getRect().left;
                }
            }
        }


        for(var i = bY1; i <= bY2 ; i++){
            if(mapData[bX][i] >= 0 || tempInteractionBlock != null){
                if(mapData[bX][i] >= 0){
                    _sf.BlockContact = mapData[bX][i];
                }
                if(mapData[bX][i] >= 3000){
                    _sf.IsInSand = true;
                    _sf.SandNum = (mapData[bX][i] - 3000) / 100;
                    return 0;
                }else if(mapData[bX][i] >= 2000){
                    _sf.IsInSand = true;
                    _sf.SandNum = (mapData[bX][i] - 2000) / 100;
                    return 0;
                }
                if(mapData[bX][i] == 4){
                    return 0;
                }
                if(isLeft){
                    return ((bX + 1) * RV.NowProject.blockSize) - datumX;
                }else{
                    return datumX - (bX * RV.NowProject.blockSize);
                }
            }
        }
        return 0;
    };

    /**
     * set action list
     * @param action | action list
     * @param isIgnore | Ignore immovable commands
     * @param isLoop | loop
     */
    this.setAction = function(action,isIgnore,isLoop){
        if(this.actionStart) return;
        actionLoop = isLoop;
        actionIgnore = isIgnore;
        for(var i = 0;i<action.length;i++){
            actionList.push(action[i]);
        }
        if(actionList.length > 0){
            this.actionStart = true;
        }
        oldSpeed = baseSpeed;
        oldGravity = _sf.isGravity;
    };

    /**
     * process action list
     */
    function updateAction(){
        if(!_sf.actionStart || actionList.length <= 0) return;
        if(actionWait > 0){
            actionWait -= 1;
            return;
        }
        if(actionMove){
            if(moveDir == 0){
                if(moveDis <= _sf.y){
                    _sf.y -= baseSpeed;
                }else{
                    actionMove = false;
                }
                return;
            }else if(moveDir == 1){
                if(moveDis >= _sf.y){
                    _sf.y += baseSpeed;
                }else{
                    actionMove = false;
                }
                return;
            }else if(moveDir == 2){
                if(moveDis <= _sf.x){
                    _sf.x -= baseSpeed;
                }else{
                    actionMove = false;
                }
                return;
            }else if(moveDir == 3){
                if(moveDis >= _sf.x){
                    _sf.x += baseSpeed;
                }else{
                    actionMove = false;
                }
                return;
            }
            if(actionIgnore && (_sf.CannotMoveX || _sf.CannotMoveY)){
                actionMove = false;
            }
            //update movement
            return;
        }


        actionPos += 1;
        if(actionPos > actionList.length - 1){
            if(actionLoop){
                actionPos = 0;
            }else{
                _sf.isGravity = oldGravity;
                baseSpeed = oldSpeed;
                actionPos = -1;
                actionList = [];
                _sf.actionStart = false;
                return;
            }
        }
        nowAction = actionList[actionPos];
        if(nowAction.code == 4101){//move
            moveDir = parseInt(nowAction.args[0]);
            if(moveDir == 4){
                moveDir = rand(0,3);
            }else if(moveDir == 5){
                if(_sf == RV.NowMap.getActor()){
                    return;
                }else{

                }
            }else if(moveDir == 6){
                if(_sf.getDir() == 0){
                    moveDir = 3;
                }else{
                    moveDir = 2;
                }
            }else if(moveDir == 7){
                if(_sf.getDir() == 0){
                    moveDir = 2;
                }else{
                    moveDir = 3;
                }
            }
            if(nowAction.args[2] == "0"){
                moveDis = parseInt(nowAction.args[1]) * RV.NowProject.blockSize;
            }else {
                moveDis = parseInt(nowAction.args[1]);
            }
            if(moveDir == 0){//up
                moveDis = _sf.y - moveDis;
            }else if(moveDir == 1){//down
                moveDis = _sf.y + moveDis;
            }else if(moveDir == 2){//left
                moveDis = _sf.x - moveDis;
            }else if(moveDir == 3){//right
                moveDis = _sf.x + moveDis;
            }
            actionMove = true;
        }else if(nowAction.code == 4104){//change Speed
            baseSpeed = parseInt(nowAction.args[0]);
        }else if(nowAction.code == 4118){//change image
            var res = RV.NowRes.findResBlock(parseInt(nowAction.args[0]));
            if(res != null){
                block.changeBitmap(res);
            }
        }else if(nowAction.code == 4108){//change Opacity
            block.getSprite().opacity = parseInt(nowAction.args[0]) / 255;
        }else if(nowAction.code == 4112){//GravityON
            _sf.isGravity = true;
            oldGravity = true;
        }else if(nowAction.code == 4113){//GravityOFF
            _sf.isGravity = false;
            oldGravity = false;
        }else if(nowAction.code == 4114){//ThroughON
            _sf.isPenetrate  = true;
        }else if(nowAction.code == 4115){//ThroughOFF
            _sf.isPenetrate = false;
        }else if(nowAction.code == 201){//wait
            actionWait = parseInt(nowAction.args[0]);
        }else if(nowAction.code == 503){//SE
            RV.GameSet.playSE("Audio/" + nowAction.args[0],parseInt(nowAction.args[1]));
        }
    }

    /**
     * get type of Interactive Block
     * @param rect | Decision rectangle
     * @returns {LInteractionBlock} | Interactive Block object
     */
    function isHaveInteractionBlock(rect){
        if(blocks == null) return null;
        for(var i = 0;i<blocks.length;i++){
            if(blocks[i] != _sf && blocks[i].getData().isItem == false && blocks[i].isCollision(rect)){
                return blocks[i];
            }
        }
        return null;
    }

    /**
     * Get display rectangle
     * @returns {*}
     */
    this.getShowRect = function(){
        return block.getSprite().GetRect();
    };
    /**
     * Get rectangle of sprite
     * @returns {*}
     */
    this.getUserRect = function(){
        return block.getSprite().GetRect();
    };
    /**
     * get direction
     * @returns {number}
     */
    this.getDir = function(){
        return 0;
    };

    this.getSprite = function(){
        return block.getSprite();
    };

    this.save = function(){
        return {
            x:_sf.x,
            y:_sf.y,
            isEat : isEat,
            isDestroy : _sf.isDestroy,
            isGravity : _sf.isGravity,
            isPenetrate:_sf.isPenetrate,
            opacity:block.getSprite().opacity
        }
    };

    this.load = function(info){
        _sf.x = info.x;
        _sf.y = info.y;
        isEat = info.isEat;
        _sf.isDestroy = info.isDestroy;
        _sf.isGravity = info.isGravity;
        _sf.isPenetrate = info.isPenetrate;
        block.getSprite().opacity = info.opacity;
        if(isEat){
            block.getSprite().visible = false;
        }
        if(_sf.isDestroy){
            if(data.isStatus){
                var rblock = RV.NowRes.findResBlock(data.BlockId2);
                if(rblock != null){
                    block.changeBitmap(rblock);
                }else{
                    block.getSprite().visible = false;
                }
            }else{
                block.getSprite().visible = false;
            }
        }

    };

    this.setSwitch = function(index,sw){
        if(RV.GameData.selfSwitch[RV.NowMap.id] == null){
            RV.GameData.selfSwitch[RV.NowMap.id] = [];
        }
        if(RV.GameData.selfSwitch[RV.NowMap.id][_sf.mark] == null){
            RV.GameData.selfSwitch[RV.NowMap.id][_sf.mark] = [false,false,false,false,false,false,false,false,false];
        }
        RV.GameData.selfSwitch[RV.NowMap.id][_sf.mark][index] = sw;
    };

    this.getSwitch = function(index){
        if(RV.GameData.selfSwitch[RV.NowMap.id] == null){
            return false;
        }
        if(RV.GameData.selfSwitch[RV.NowMap.id][_sf.mark] == null){
            return false;
        }
        return RV.GameData.selfSwitch[RV.NowMap.id][_sf.mark][index];
    }

}/**
 * Created by Yitian Chen on 2019/1/8.
 * Logic of map
 * @param id | map ID
 * @param func | callback function
 * @param x | Initialize x-coordinate of character
 * @param y | Initialize y-coordinate of character
 */
function LMap(id,func,x,y){

    var _sf = this;
    this.id = id;
    //Globalize the current map
    RV.NowMap = this;
    //callback of changing map
    this.changeMap = null;

    //Get data of map
    var data = RV.NowProject.findMap(id);
    var scene = RV.NowRes.findResMap(data.backgroundId);
    //Calculate map size
    var width = data.width * RV.NowProject.blockSize;
    var height = data.height * RV.NowProject.blockSize;
    //Generate map viewport
    var view = new IViewport(0 , 0 , RV.NowProject.gameWidth , RV.NowProject.gameHeight);
    view.z = 10;

    var actor = null;//actor
    //Double vision
    var back1 = null;
    var back2 = null;
    //data of blocks
    var mapData = [];
    // shake
    var ShakePower,ShakeSpeed,ShakeDuration,ShakeDirection,Shake;
    var oldVpX,oldVpY;
    var StartShake;
    //move viewport
    this.viewMove = false;
    this.viewSpeed = 0;
    this.viewDis = 0;
    this.viewDir = 0;
    //draw enemy
    this.drawEnemys = function(enemy,camp){
        var e = new LEnemy(enemy , view , mapData , interactionBlock,data);
        if(camp != null){
            e.getActor().camp = camp;
        }
        enemys.push(e);
    };
    //Initialize shake
    shakeInit();
    //Initialize background of map
    if(scene.background1.file != "" && scene.background1.file != null){
        back1 = new ISprite(RF.LoadBitmap("Scene/" + scene.background1.file));
        back1.tiling = scene.background1.type == 0;
        if(back1.tiling){
            back1.RWidth = width;
            back1.RHeight = height;
        }
        back1.z = 1;
    }

    if(scene.background2.file != "" && scene.background2.file != null){
        back2 = new ISprite(RF.LoadBitmap("Scene/" + scene.background2.file),view);
        back2.tiling = scene.background2.type == 0;
        if(back2.tiling){
            back2.RWidth = width;
            back2.RHeight = height;
        }
        back2.z = 2;
    }

    //static state
    var mapSprite = new Array(5);
    //dynamic data
    var block = [];
    var interactionBlock = [];
    var decorates = [];
    var enemys = [];
    var trigger = [];


    var isInit = false;

    //load resource of map
   function loadRes(func){
        var nowIndex = 0;
        var maxIndex = 0;

        maxIndex += scene.blocks.length;
        maxIndex += scene.decorates.length;

        for(var i = 0;i<scene.blocks.length;i++){
            var rb = RV.NowRes.findResBlock(scene.blocks[i].id) ;
            RF.LoadCache("Block/" + rb.file,function(){
                nowIndex += 1;
                if(nowIndex >= maxIndex){
                    func();
                }
            },null);
        }

        for(i = 0;i < scene.decorates.length ; i++){
            var rd = RV.NowRes.findResDecorate(scene.decorates[i]);
            RF.LoadCache("Decorate/" + rd.file,function(){
                nowIndex += 1;
                if(nowIndex >= maxIndex){
                    func();
                }
            },null)
        }
        
        if(maxIndex <= 0){
           func();
       }


    }


    /**
     * Initialize the map
     * @param x | X-coordinate to change
     * @param y | Y-coordinate to change
     * @param isNewActor
     */
    function init(x,y,needNewActor){
        mapData = [];
        //z of layer
        var zA = [10,210,220,230,1000];
        //Generate 5 sprites for each scene sprite
        for(var i = 0; i < 5; i++){
            mapSprite[i] = new ISprite(IBitmap.CBitmap(width,height),view);
            mapSprite[i].z = zA[i];
        }
        //Start drawing blocks
        for(i = 0 ; i < data.width ; i++){
            mapData[i] = [];
            for(var j = 0 ; j < data.height ; j++){
                mapData[i][j] = -9976;
                //Ground Layer
                if(data.backgroud[i][j] > 0){
                    drawDecorate(mapSprite[0],decorates,i,j,data.backgroud[i][j] - 1,zA[0])
                }
                //Block layer
                if(data.level1[i][j] != null){
                    drawBlock(mapSprite[1],block,i,j,data.level1[i][j],zA[1]);
                }
                if(data.level2[i][j] != null){
                    drawBlock(mapSprite[2],block,i,j,data.level2[i][j],zA[2]);
                }
                if(data.level3[i][j] != null){
                    drawBlock(mapSprite[3],block,i,j,data.level3[i][j],zA[3]);
                }
                //Foreground
                if(data.decorate[i][j] > 0){
                    drawDecorate(mapSprite[4],decorates,i,j,data.decorate[i][j] - 1,zA[4]);
                }
            }

        }

        //put actor in the corresponding position
        if(needNewActor || actor == null){
            actor = new LActor(view,width,height,mapData,interactionBlock,x * RV.NowProject.blockSize,y * RV.NowProject.blockSize,
                RV.NowSet.findActorId(RV.GameData.actor.getActorId()).actorId,200 );
        }else{
            var oldP = actor.getCharacter().CanPenetrate;
            actor.getCharacter().CanPenetrate = true;
            actor.setInitData(width,height,mapData,interactionBlock);
            actor.getCharacter().x = x * RV.NowProject.blockSize;
            actor.getCharacter().y = y * RV.NowProject.blockSize;
            actor.getCharacter().CanPenetrate = oldP;
        }

        actor.IsGravity = RV.GameData.isGravity;
        actor.IsCanPenetrate = RV.GameData.isCanPenetrate;
        actor.GravityNum = (RV.GameData.gravityNum / 100) * data.gravity;
        actor.JumpNum = RV.GameData.jumpNum * data.resistance;
        actor.JumpTimes = RV.GameData.jumpTimes;
        actor.isLook = true;
        actor.isLook = true;
        actor.atkDis = RV.GameData.actor.getAtkDis();
        actor.bulletId = RV.GameData.actor.getBulletAnimId();
        actor.atkType = RV.GameData.actor.getSetData().attackType;
        actor.camp = 0;
        actor.lookActor();
        actor.getCharacter().getSpirte().mirror = RV.GameData.dir == 1;
        actor.getCharacter().isActor = true;
        //draw enemies
        for(i = 0 ; i < data.enemys.length ; i++){
            _sf.drawEnemys(data.enemys[i]);
        }
        //draw triggers
        for(i = 0 ; i < data.trigger.length;i++){
            trigger.push(new LTrigger(data.trigger[i],view , mapData , interactionBlock,data));
        }

        //play music of map
        data.bgm.play(0);
        data.bgs.play(1);
        _sf.viewMove = data.autoMove;
        _sf.viewSpeed = data.autoMoveSpeed;
        _sf.viewDir = data.autoDir;

        if(RV.GameData.getMapData() != null){
            _sf.loadMap(RV.GameData.getMapData());
            RV.GameData.clearMapData();
        }
    }


    /**
     * draw blocks
     * @param mapSp | map sprite
     * @param blocks | blocks
     * @param x | x-coordinate
     * @param y | y-coordinate
     * @param block | data of blocks
     * @param z | layer z
     * @param isAuto | is in Auto Layer or not
     */
    function drawBlock(mapSp,blocks,x,y,block,z){
        var rbb = null;
        if(block.type != -1){
            if(block.id < scene.blocks.length){
                rbb = RV.NowRes.findResBlock(scene.blocks[block.id].id);
                if(rbb != null){
                    if(scene.blocks[block.id].type == 4){
                        if(rbb.drawType == 0){
                            setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                        }else if(rbb.drawType == 1 && (block.drawIndex == 20 || block.drawIndex == 21 || block.drawIndex == 22 ||
                            block.drawIndex == 23 || block.drawIndex == 33 || block.drawIndex == 34 || block.drawIndex == 35 ||
                            block.drawIndex == 36 || block.drawIndex == 37 || block.drawIndex == 42 || block.drawIndex == 43 ||
                            block.drawIndex == 45 || block.drawIndex == 46 || block.drawIndex == 47)){
                            setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                        }else if(rbb.drawType == 2 && (block.drawIndex == 0 || block.drawIndex == 1 || block.drawIndex == 2)){
                            setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                        }
                    }else{
                        setBaseBlockType(x,y,scene.blocks[block.id],rbb);
                    }
                }


            }
        }else{
            var sbi = RV.NowSet.findBlockId(block.id);
            interactionBlock.push(new LInteractionBlock(sbi,block ,view,x,y, z ,mapData , interactionBlock,data));
            return;
        }

        if(rbb != null){
            var r = null;
            var tx = 0;
            var ty = 0;
            var cof = null;
            var tempx = 0;
            var tempy = 0;
            if(rbb.anim.length == 1){
                r = rbb.anim[0].getRect();
                if(rbb.drawType == 0){
                    cof = new IBCof(RF.LoadCache("Block/" + rbb.file), r.left, r.top, r.width, r.height);
                }else if(rbb.drawType == 1){
                    tempx = block.drawIndex % 8;
                    tempy = parseInt(block.drawIndex / 8);
                    cof = new IBCof(RF.LoadCache("Block/" + rbb.file), r.left + tempx * RV.NowProject.blockSize,
                        r.top + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
                }else if(rbb.drawType == 2){
                    tempx = block.drawIndex % 3;
                    tempy = parseInt(block.drawIndex / 3);
                    cof = new IBCof(RF.LoadCache("Block/" + rbb.file), r.left + tempx * RV.NowProject.blockSize,
                        r.top + tempy * RV.NowProject.blockSize, RV.NowProject.blockSize, RV.NowProject.blockSize);
                }
                tx = x * RV.NowProject.blockSize;
                ty = y * RV.NowProject.blockSize;
                mapSp.drawBitmapBCof(tx , ty , cof , false);
            }else{
                blocks.push(new LBlock(rbb,block,view,x,y,z));
            }
        }
    }


    /**
     * set blocks
     * @param x | x-coordinate
     * @param y | y-coordinate
     * @param block | blocks data of map
     * @param rbb | resource data of blocks
     */
    function setBaseBlockType(x,y,block,rbb){
        if(block.type == 2){//load SwampBlock
            if(mapData[x][y] >= 0) return;
            if(rbb.mDie){
                mapData[x][y] = 3000 + rbb.mNum;
            }else{
                mapData[x][y] = 2000 + rbb.mNum;
            }
        }else{
            mapData[x][y] = block.type;
        }

    }


    /**
     * draw decoration
     * @param mapSp | map sprite
     * @param decorates | decorations set
     * @param x  | x-coordinate
     * @param y | y-coordinate
     * @param index | decoration ID
     * @param z | layer z
     */
    function drawDecorate(mapSp , decorates , x , y , index , z){
        var rd = scene.getDec(index);
        if(rd != null){
            var r = null;
            if(rd.type == 0 && rd.anim.length == 1){
                r = rd.anim[0].getRect();
                var cof = new IBCof(RF.LoadCache("Decorate/" + rd.file) , r.left, r.top, r.width, r.height);
                var tx = x * RV.NowProject.blockSize;
                tx = tx - (r.width - RV.NowProject.blockSize) / 2;
                var ty = (y + 1) * RV.NowProject.blockSize;
                ty = ty - r.height;
                mapSp.drawBitmapBCof(tx , ty , cof , false)
            }else{
                var dec = new LDecorate(rd,view,width,height,x,y,z);
                decorates.push(dec);
            }
        }
    }


    /**
     * update
     */
    this.update = function(){
        if(isInit) return;
        if(back1 != null){
            back1.x = view.ox / 2;
            back1.y = view.oy;
        }

        for(var i = 0;i<decorates.length;i++){
            decorates[i].update();
        }
        for(i = 0;i<block.length;i++) {
            block[i].update();
        }
        for(i = 0;i<interactionBlock.length;i++){
            interactionBlock[i].update();
        }
        for(i = 0;i<enemys.length;i++){
            enemys[i].update();
        }
        for(i = 0 ; i < trigger.length;i++){
            trigger[i].update();
        }
        if(actor != null){
            actor.update();
            oldVpX = view.ox;
            oldVpY = view.oy;
        }
        updateShack();
        updateViewport();
    };

    /**
     * Dispose
     */
    this.dispose = function(noDisposeActor){
        if(back1 != null) back1.dispose();
        if(back2 != null) back2.dispose();
        back1 = null;
        back2 = null;

        mapData = [];

        for(var i = 0;i<mapSprite.length;i++){
            mapSprite[i].dispose();
            mapSprite[i] = null;
        }
        mapSprite = new Array(5);

        for(i = 0;i<decorates.length;i++){
            decorates[i].dispose();
        }
        for(i = 0;i<block.length;i++) {
            block[i].dispose();
        }
        for(i = 0;i<interactionBlock.length;i++){
            interactionBlock[i].dispose();
        }
        for(i = 0;i<enemys.length;i++){
            enemys[i].dispose();
        }
        for(i = 0 ; i < trigger.length;i++){
            trigger[i].dispose();
        }
        if(actor != null && noDisposeActor == null){
            actor.dispose();
        }

        block = [];
        interactionBlock = [];
        decorates = [];
        enemys = [];
        trigger = [];
    };

    /**
     * set camera xy
     * @param x
     * @param y
     */
    this.setXY = function(x,y){
        view.ox = x;
        view.oy = y;
    };

    /**
     * Get actor
     * @returns {*}
     */
    this.getActor = function(){
        return actor;
    };

    /**
     * Get map data
     * @returns {DMap}
     */
    this.getData = function(){
        return data;
    };

    /**
     * change global gravity
     * @param gravity
     */
    this.changeGravityNum = function(gravity){
        //global gravity
        RV.GameData.gravityNum = gravity;
        //correct character gravity of map
        actor.GravityNum = (RV.GameData.gravityNum / 100) * data.gravity;
        actor.Speed[0] = 0;
        //correct trigger gravity of map
        for(var i = 0;i<trigger.length;i++){
            trigger[i].updateGravityNum();
        }
        //correct enemy
        for(i = 0;i<enemys.length;i++){
            enemys[i].updateGravityNum();
        }
        //reset Speed of interactive blocks
        for(i = 0;i<interactionBlock.length;i++){
            interactionBlock[i].speed[0] = 0;
        }

    };

    /**
     * Get viewport of map
     * @returns {IViewport}
     */
    this.getView = function(){
        return view;
    };

    /**
     * Get enemies of map
     * @returns {Array}
     */
    this.getEnemys = function(){
        return enemys;
    };

    /**
     * Get blocks of map
     * @returns {Array}
     */
    this.getMapData = function(){
        return mapData;
    };

    /**
     * Get all the triggers of map
     * @returns {Array}
     */
    this.getEvents = function(){
        return trigger;
    };

    /**
     * find enemy
     * @param index
     * @returns {null|*}
     */
    this.findEnemy = function(index){
        for(var i = 0;i<enemys.length;i++){
            if(enemys[i].index == index){
                return enemys[i];
            }
        }
        return null;
    };

    /**
     * find trigger
     * @param id
     * @returns {null|*}
     */
    this.findEvent = function(id){
        if(typeof(id)=='string'){
            return _sf.findBlock(id);
        }else{
            for(var i = 0;i<trigger.length;i++){
                if(trigger[i].id == id){
                    return trigger[i];
                }
            }
        }
        return null;
    };

    /**
     * find interactive block
     * @param mark
     * @returns {*}
     */
    this.findBlock = function(mark){
        for(var i = 0;i<interactionBlock.length;i++){
            if(interactionBlock[i].mark == mark){
                return interactionBlock[i];
            }
        }
    };


    /**
     * Transfer Player/change map
     * @param mapId | map ID
     * @param x | x-coordinate of actor
     * @param y | y-coordinate of actor
     * @param dir | direction
     * @param end | end callback
     */
    this.moveMap = function(mapId,x,y,dir,end){

        if(mapId == data.id){
            actor.getCharacter().x = x * RV.NowProject.blockSize;
            actor.getCharacter().y = y * RV.NowProject.blockSize;
            actor.getCharacter().setLeftRight(dir == 1);
            actor.stopAction();
            end();
            return;
        }
        this.dispose(true);
        data = RV.NowProject.findMap(mapId);
        scene = RV.NowRes.findResMap(data.backgroundId);
        width = data.width * RV.NowProject.blockSize;
        height = data.height * RV.NowProject.blockSize;

        if(scene.background1.file != "" && scene.background1.file != null){
            back1 = new ISprite(RF.LoadBitmap("Scene/" + scene.background1.file));
            back1.tiling = scene.background1.type == 0;
            if(back1.tiling){
                back1.RWidth = width;
                back1.RHeight = height;
            }
            back1.z = 1;
        }

        if(scene.background2.file != "" && scene.background1.file != null){
            back2 = new ISprite(RF.LoadBitmap("Scene/" + scene.background2.file),view);
            back2.tiling = scene.background2.type == 0;
            if(back2.tiling){
                back2.RWidth = width;
                back2.RHeight = height;
            }
            back2.z = 2;
        }

        if(data != null){
            loadRes(function(){
                isInit = true;
                init(x,y,false);
                actor.stopAction();
                if(dir >= 0){
                    actor.getCharacter().setLeftRight(dir == 1);
                }
                if(_sf.changeMap != null) _sf.changeMap(actor);
                end();
                isInit = false;
            });
        }

    };

    this.saveMap = function(){
        var eny = [];
        for(var i = 0;i<enemys.length;i++){
            if(enemys[i].index >= 0){
                eny[enemys[i].index] = enemys[i].save();
            }
        }
        var tri = [];
        for(i = 0;i<trigger.length;i++){
            tri[trigger[i].id] = trigger[i].save();
        }
        var blk = {};
        for(i = 0;i<interactionBlock.length;i++){
            blk[interactionBlock[i].mark] = interactionBlock[i].save();
        }
        return {
            enemy : eny,
            trigger : tri,
            interactionBlock :blk
        }
    };

    this.loadMap = function(data){
        for(var i = 0;i<enemys.length;i++){
            var index = enemys[i].index;
            if(index >= 0 && data.enemy[index] != null){
                enemys[i].load(data.enemy[index]);
            }
        }
        for(i = 0;i<trigger.length;i++){
            var id = trigger[i].id;
            if(data.trigger[id] != null){
                trigger[i].load(data.trigger[id]);
            }
        }
        for(i = 0;i<interactionBlock.length;i++){
            var mark = interactionBlock[i].mark;
            if(data.interactionBlock[mark] != null){
                interactionBlock[i].load(data.interactionBlock[mark]);
            }
        }

    };

    /**
     * initialize the shake data
     */
    function shakeInit(){
        oldVpX = view.ox;
        oldVpY = view.oy;
        ShakePower = 0;
        ShakeSpeed = 0;
        ShakeDuration = 0;
        ShakeDirection = 1;
        Shake = 0;
    }

    /**
     * start to shake
     * @param power | power
     * @param speed | Speed
     * @param duration | duration
     */
    this.startShack = function( power, speed, duration){
        ShakePower = power;
        ShakeSpeed = speed;
        ShakeDuration = duration;
        oldVpX = view.ox;
        oldVpY = view.oy;
        StartShake = true;
    };

    /**
     * update the data of shake
     */
    function updateShack(){
        if(ShakeDuration >= 1  || Shake != 0 || ShakeDuration == -1){
            var delta =ShakePower * ShakeSpeed * ShakeDirection / 10.0;
            if( (ShakeDuration != -1 && ShakeDuration <= 1) || Shake * (Shake + delta) < 0){
                Shake = 0;
            }else{
                Shake += delta;
            }
            if(Shake > ShakePower * 2){
                ShakeDirection -= 1;
            }
            if(Shake < -ShakePower * 2){
                ShakeDirection += 1;
            }
            if(ShakeDuration >= 1){
                ShakeDuration -= 1;
            }
            if(Shake == 0 && ShakeDuration >= 1){
                Shake = 1;
            }
        }
    }

    /**
     * update the shake viewport
     */
    function updateViewport(){
        if(Shake == 0) {
            if(StartShake){
                StartShake = false;
                view.ox = oldVpX;
                view.oy = oldVpY;
            }
            return;
        }
        var f = rand(0,10);
        view.ox = oldVpX + (f % 2 == 0 ? Shake : Shake * -1);
        f = rand(0,10);
        view.oy = oldVpY + (f % 2 == 0 ? Shake : Shake * -1);
    }

    loadRes(function(){
        isInit = true;
        init(x,y,true);
        func(actor);
        isInit = false;
    });


}/**
 * Created by Yitian Chen on 2018-2-26.
 * Text box
 */
function LMessage(){

    var _sf = this;

    //draw viewport
    this.viewport = null;
    this.talkBack = null;
    this.talkDraw = null;
    this.nameBack = null;
    this.nameDraw = null;

    //Text hosting
    this.showText = "";
    this.makeText = "";

    this.pt = null;
    this.isNext = false;

    this.dx = 0;
    this.dy = 0;
    this.speed = 0;
    this.speedTmp = 0;
    this.isDrawAll = false;

    var color;
    //shake text box
    var ShakePower,ShakeSpeed,ShakeDuration,ShakeDirection,Shake;

    var fontSize;
    var wait;
    var pass;

    var setB;

    this.viewport = new IViewport(0, 0, RV.NowProject.gameWidth, RV.NowProject.gameHeight);
    this.viewport.z = 8000;
    //text box·Main
    this.talkBack = new ISprite(RF.LoadBitmap("System/DialogBox/back-text.png"),this.viewport);
    this.talkBack.z = 8000;
    this.talkBack.y = RV.NowProject.gameHeight - 140 - 10;
    this.talkBack.x = (RV.NowProject.gameWidth - 908) / 2;
    this.talkDraw = new ISprite(IBitmap.CBitmap(908, 140),this.viewport);
    this.talkDraw.z = 8001;
    this.talkDraw.y = this.talkBack.y + 30;
    this.talkDraw.x = this.talkBack.x + 20;
    //name box
    this.nameBack = new ISprite(RF.LoadBitmap("System/DialogBox/back-name.png"),this.viewport);
    this.nameBack.z = 8002;
    this.nameBack.y = this.talkBack.y - 14;
    this.nameBack.x = this.talkBack.x + 10;
    this.nameDraw = new ISprite(IBitmap.CBitmap(184, 36),this.viewport);
    this.nameDraw.z = 8003;
    this.nameDraw.y = this.nameBack.y;
    this.nameDraw.x = this.nameBack.x;
    //shake
    ShakePower = 0;
    ShakeSpeed = 0;
    ShakeDuration = 0;
    ShakeDirection = 1;
    Shake = 0;
    this.pt = new ISprite(RF.LoadBitmap("System/DialogBox/tips.png"),this.viewport);
    this.pt.z = 8005;
    this.pt.x = this.talkBack.x + 908 - 30;
    this.pt.y = this.talkBack.y + 140 - 15;
    this.pt.addAction(action.move, this.pt.x,this.pt.y,20);
    this.pt.addAction(action.wait, 20);
    this.pt.addAction(action.move, this.pt.x,this.pt.y + 5,20);
    this.pt.addAction(action.wait, 20);
    this.pt.actionLoop = true;
    this.pt.visible = false;
    
    var noLatin = false;

    /**
     * disappear
     */
    this.re = function(){
        setB = true;
        this.viewport.x = 0;
        this.viewport.y = 0;
        this.fadeOut();
    };

    /**
     * set position of text box
     * @param b | visible or not
     * @param point | position
     */
    this.setThis = function( b,point){
        this.nameBack.visible = b;
        this.talkBack.visible = b;
        setB = b;
        this.pt.visible = b;
        this.viewport.x = 0;
        if(point == 0){
            this.viewport.y = -RV.NowProject.gameHeight + 180;
        }else if(point == 1){
            this.viewport.y =  -RV.NowProject.gameHeight / 2;
        }else if(point == 2){
            this.viewport.y = 0;
        }

    };

    /**
     * Start shaking
     * @param power | power
     * @param speed | Speed
     * @param duration | duration
     * @constructor
     */
    this.StartShack = function( power, speed, duration){
        ShakePower = power;
        ShakeSpeed = speed;
        ShakeDuration = duration;
    };

    /**
     * loop shake
     */
    function updateShack(){
        if(ShakeDuration >= 1  || Shake != 0 || ShakeDuration == -1){
            var delta = ( ShakePower * ShakeSpeed * ShakeDirection / 10.0);
            if( (ShakeDuration != -1 && ShakeDuration <= 1) || Shake * (Shake + delta) < 0){
                Shake = 0;
            }else{
                Shake += delta;
            }
            if(Shake > ShakePower * 2){
                ShakeDirection -= 1;
            }
            if(Shake < -ShakePower * 2){
                ShakeDirection += 1;
            }
            if(ShakeDuration >= 1){
                ShakeDuration -= 1;
            }
            if(Shake == 0 && ShakeDuration >= 1){
                Shake = 1;
            }
        }
    }

    /**
     * update viewport
     */
    function updateViewPort(){
        var f = rand(0,10);
        _sf.viewport.ox = f % 2 == 0 ? Shake : Shake * -1;
        f = rand(0,10);
        _sf.viewport.oy = f % 2 == 0 ? Shake : Shake * -1;
    }

    /**
     * draw name
     * @param name | name
     */
    function drawName( name){
        if(name.length <= 0){
            _sf.nameDraw.visible = false;
            _sf.nameBack.visible = false;
            return;
        }else {
            _sf.nameDraw.visible = true;
            _sf.nameBack.visible = setB;
        }
        _sf.nameBack.x = 50;
        _sf.nameDraw.x = _sf.nameBack.x;
        var w = IFont.getWidth(name, 20);
        var h = IFont.getHeight(name, 20);
        _sf.nameDraw.clearBitmap();
        _sf.nameDraw.drawText(RF.C0().TColor() + "\\s[16]" + name, (_sf.nameDraw.width - w) / 2,  (_sf.nameDraw.height - h) / 2);
        _sf.nameDraw.updateBitmap();
    }

    /**
     * showing text or not
     * @returns {boolean}
     */
    this.isShowing = function(){
        return this.showText.length > 0;
    };

    /**
     * Main draw
     */
    this.updateDraw = function(){
        updateShack();
        updateViewPort();
        if(this.showText == null || this.showText.length <= 0){
            this.pt.visible = this.talkBack.visible;
            return;
        }
        if(pass){
            this.pt.visible = this.talkBack.visible;
            if(RF.IsNext()){
                IInput.up = false;
                pass = false;
            }
            return;
        }
        if(RF.IsNext()){
            IInput.up = false;
            this.isDrawAll = true;
            return
        }
        if(wait > 0){
            wait -= 1;
            return;
        }

        if(this.speedTmp > 0){
            this.speedTmp -= 1;
            return;
        }else{
            this.speedTmp = this.speed;
        }

        while (true) {
            if(this.showText.length <= 0){
                break;
            }
            var min = this.showText.substring(0,1);
            this.showText = this.showText.substring(1,this.showText.length);
            var c = min.charCodeAt(0);
            if(c == 60000){//换行
                this.dy += (IFont.getHeight(min, 20) * 1.3);
                this.dx = 0;
            }else if(c == 60001){//更改颜色
                var returnS = TextToTemp(this.showText,"[","]","\\[([0-9]+[，,][0-9]+[，,][0-9]+)]");
                color = new IColor(returnS[0]);
                this.showText = returnS[1];
            }else if(c == 60002){//更改字体大小
                returnS = TextToTemp(this.showText , "[","]","\\[([0-9]+)]");
                fontSize = parseInt(returnS[0]);
                this.showText = returnS[1];
            }else if(c == 60100){
                //this.showText = RV.User.name + this.showText;
                break;
            }else if(c == 60101){//全部显示
                this.isDrawAll = true;
            }else if(c == 60102){//等待10帧
                wait = 10;
                break;
            }else if(c == 60103){//等待20帧
                wait = 20;
                break;
            }else if(c == 60104){//等待指定
                returnS = TextToTemp(this.showText , "[","]","\\[([0-9]+)]");
                wait = parseInt(returnS[0]);
                this.showText = returnS[1];
                break;
            }else if(c == 60105){//自动结束本对话
                this.isNext = true;
                break;
            }else if(c == 60106){//暂停
                pass = true;
                break;
            }else if(c == 60003){//显示变量
                returnS = TextToTemp(this.showText , "[","]","\\[([a-zA-Z0-9-_]+)]");
                this.showText = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
            }else {
                this.talkDraw.drawTextQ(min, this.dx, this.dy, color, fontSize);

                if(this.showText.length > 0){
                    var next_m = this.showText.substring(0,1);
                    var next_w = 0;

                    if(noLatin){
                        next_w = IFont.getWidth(next_m, fontSize);
                    }else{
                        var num_index = this.showText.search("[ ,.!?:]");
                        if(num_index >= 0){
                            next_w = IFont.getWidth(this.showText.substr(0,num_index),fontSize);
                        }else{
                            next_w = IFont.getWidth(this.showText,fontSize);
                        }
                        if(next_w > this.talkDraw.width -30) next_w = IFont.getWidth(next_m, fontSize);
                    }
                    this.dx += IFont.getWidth(min,fontSize);
                    if(this.dx + next_w >= this.talkDraw.width - 30){
                        this.dx = 0;
                        this.dy += (IFont.getHeight(min, fontSize) * 1.3);
                    }
                }
            }
            if(!this.isDrawAll){
                break;
            }
        }
        this.talkDraw.updateBitmap();
    };

    /**
     * set text box
     * @param name | name
     * @param msg | contents
     */
    this.talk = function( name, msg){
        wait = 0;
        this.pt.visible = false;
        _sf.fadeIn();
        drawName(name);
        fontSize = 20;
        this.makeText = msg;
        this.talkDraw.clearBitmap();
        this.talkDraw.updateBitmap();
        noLatin = RF.CheckLanguage(msg);
        this.showText = RF.TextAnalysis(this.makeText);
        this.talkBack.visible = true;
        this.dx = 0;
        this.dy = 0;
        this.isDrawAll = false;
        color = RF.C0();
        this.speed = 2;
        this.speedTmp = this.speed;
        this.talkBack.visible = setB;
        this.talkDraw.visible = true;
        this.isNext = false;
    };

    /**
     * disappear text box
     */
    this.fadeOut = function(){
        this.pt.visible = false;
        this.talkBack.visible = false;
        this.talkDraw.visible = false;
        this.nameBack.visible=false;
        this.nameDraw.visible = false;
    };

    /**
     * show text box
     */
    this.fadeIn = function(){
        this.pt.visible = setB;
        this.talkBack.visible = setB;
        this.talkDraw.visible = setB;
        this.nameBack.visible = setB;
        this.nameDraw.visible = setB;
    };

    /**
      * Text regular extraction
      * @param mainText | The string to be extracted
      * @param s | leading special sign
      * @param e | back special sign
      * @param rex | regular expression
      * @returns {* []} Extracted content
     */
    function TextToTemp( mainText, s, e, rex){
        var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
        mainText = mainText.substring(tmp.length + s.length + e.length, mainText.length);
        var temp1 = tmp.replaceAll(rex, "$1");
        var temp_2 = temp1.replaceAll(" ", "");
        var temp_e = temp_2.replaceAll("，", ",");
        return [temp_e,mainText];
    }

    /**
     * Dispose
     */
    this.dispose = function(){
        this.pt.dispose();
        this.nameBack.dispose();
        this.nameDraw.dispose();
        this.talkBack.dispose();
        this.talkDraw.dispose();
        //this.pointText.dispose();
        this.viewport.dispose();
    };

    /**
     * set layer z
     * @param z
     */
    this.setZ = function(z){
        this.viewport.z = z;
    };

}/**
 * Created by Yitian Chen on 2018/7/17.
 * dialog box
 * @param vp | viewport
 */
function LMessagePop(vp){

    var _sf = this;
    //draw name box
    var name = new ISprite(RF.LoadBitmap("System/DialogBox/bubble/back-name.png"),vp);
    name.width = 122;
    name.height = 24;
    name.visible = false;
    name.z = 999999 + 12;
    //name box
    var nameDraw = new ISprite(IBitmap.CBitmap(name.width,name.height),vp);
    nameDraw.z = 999999 + 13;
    //main box
    var main = null;
    var mainDraw = null;
    //images of dialog box
    var talkBmp2 = [];
    //arrow of dialog box
    var pos2 = RF.LoadBitmap("System/DialogBox/bubble/back-text-pos.png");
    //starting or not
    var isStart = false;
    //spacing of text
    var wait = 0;
    //Currently drawn text
    var showText = "";
    //pause and wait for pressing
    var pass = false;
    //Speed
    var speed = 2;
    //old Speed
    var speedTmp = speed;
    //offset
    var dx = 0;
    var dy = 0;
    //text color
    var color = null;
    var fontSize = 16;
    //target object ID
    var nowID = -1;

    var posSprite = new ISprite(pos2,vp);
    posSprite.z = 999999 + 14;
    posSprite.opacity = 0;

    this.isDrawAll = false;
    this.isNext = false;

    //load images of dialog box
    for(var i = 0; i < 9 ; i++) {
        talkBmp2[i] = RF.LoadBitmap("System/DialogBox/bubble/back-text_" + i + ".png");
    }
    
    var noLatin = false;

    /**
     * disappear dialog box
     */
    this.none = function(){
        name.visible = false;
        nameDraw.visible = false;
        if(main != null){
            main.visible = false;
            mainDraw.visible = false;
        }
        posSprite.visible = false;
        posSprite.opacity = 0;
        isStart = false;
    };

    /**
     * showing text or not
     * @returns {boolean}
     */
    this.isShowing = function(){
        return showText.length > 0;
    };

    /**
     * set dialog
     * @param nm | name
     * @param msg | contents
     * @param id | target id -10 actor self; -20 this trigger
     */
    this.talk = function(nm,msg,id){
        nowID = id;
        //initialization
        isStart = false;
        if(mainDraw != null){
            mainDraw.dispose();
            mainDraw = null;
        }
        name.visible = false;
        nameDraw.visible = false;
        if(nm != null && nm.length > 0 && nm != " "){
            name.visible = true;
            nameDraw.visible = true;
            makeName(nm);
        }

        noLatin = RF.CheckLanguage(msg);
        makeBlock(RF.TextAnalysisNull(msg), talkBmp2);
        showText = RF.TextAnalysis(msg);
        speed = 2;
        speedTmp = speed;
        dx = 10;
        dy = 8;
        color = RF.C0();
        fontSize = 16;
        this.isDrawAll = false;
        this.isNext = false;
        var endX = 0;
        var endY = 0;
        //Calculate relative display position
        if(id == -10){
            var actor = RV.NowMap.getActor().getCharacter().getSpirte();
            endY = actor.y - main.height + 5;
            endX = actor.x + (actor.width - main.width) / 2;
            posSprite.x = actor.x + (actor.width) / 2;
        }else{
            if(id == -20){
                id = RV.NowEventId;
            }
            var event = RV.NowMap.findEvent(id);
            if(event != null){
                var rect = event.getRect();
                if(rect != null){
                    endX = rect.left + (rect.width - main.width) / 2;
                    endY = rect.top - main.height + 5;
                    posSprite.x = rect.left + ( rect.width) / 2;
                }

            }
        }
        main.x = endX;
        main.y = endY + 50;
        mainDraw.x = main.x;
        mainDraw.y = endY;
        main.fade(0,1.0,20);
        main.slideTo(main.x,endY,20);
        main.setOnEndSlide(function(){
            isStart = true;
        });
        //Calculate name box position
        if(nm != null && nm.length > 0){
            name.x = main.x;
            name.y = main.y + 30;
            name.fade(0,1,20);
            name.slideTo(name.x,endY - 24,20);
            nameDraw.x = name.x;
            nameDraw.y = name.y;
            nameDraw.fade(0,1,20);
            nameDraw.slideTo(name.x,endY - 24,20);
        }
        posSprite.y = endY + main.height - 12;
        posSprite.visible = true;
        posSprite.addAction(action.wait,10);
        posSprite.addAction(action.fade,1,20);
    };

    /**
     * draw name
     * @param name | name
     */
    function makeName(name){
        nameDraw.clearBitmap();
        nameDraw.drawText(RF.C0().TColor() + "\\s[16]" + name, 15,  1);
        nameDraw.updateBitmap();
    }

    /**
     * draw dialog box
     * @param msg | contents
     * @param bmp | images of dialog box
     */
    function makeBlock(msg,bmp){
        var msgs = msg.split(RF.CharToAScII(60000));
        var width = 0;
        var line = noLatin ? 0 : 1;
        for(var i = 0;i<msgs.length;i++){
            if(noLatin){
                var tempw = IFont.getWidth(msgs[i], 16);
                if(tempw > width){
                    width = tempw;
                }
                line += Math.ceil(tempw / 280.0);
            }else{
                var words = msg.split(/[ ,.!?:]/);
                var lineWidth = 0;
                for(var j = 0;j < words.length;j++){
                    var nextw = IFont.getWidth(words[j] + " ", 16);
                    lineWidth += nextw;
                    if(lineWidth > width){
                        width = lineWidth;
                    }
                    if(lineWidth > 280 ){
                        if(nextw > lineWidth - nextw){
                            line +=  Math.ceil(lineWidth / 280.0);
                        }else{
                            line +=  Math.ceil((lineWidth - nextw) / 280.0);
                        }
                        lineWidth = nextw;
                        width = 280;
                    }
                }
            }
        }

        var height = 40;
        if(line > 1){
            height += (line - 1) * IFont.getHeight("A", 16) * 1.2;
            width = parseInt(Math.min(280,width));
        }
        if(width < 122){
            width = 122;
        }
        if(main != null){
            main.disposeMin();
            main = null;
        }
        main = new ISprite(IBitmap.CBitmap(width + 20, height + 9) , vp);
        main.z = 999999 + 10;
        mainDraw = new ISprite(IBitmap.CBitmap(main.width,main.height),vp);
        mainDraw.z = 999999 + 11;
        var w = width + 20;
        RF.DrawFrame(main, bmp, w, height, 0, 0,8);
        //绘制尖尖
        //main.drawBitmap(pos2,(main.width - 11) / 2 + 5,height - 2,false);
    }

    /**
     * update position
     */
    function updatePoint(){
        var endY = 0,endX = 0;
        if(nowID == -10){
            var actor = RV.NowMap.getActor().getCharacter().getSpirte();
            endY = actor.y - main.height + 5;
            endX = actor.x + (actor.width - main.width) / 2;
            posSprite.x = actor.x + (actor.width) / 2;
        }else{
            if(nowID == -20){
                nowID = RV.NowEventId;
            }

            var event = RV.NowMap.findEvent(nowID);
            if(event != null){
                var rect = event.getRect();
                if(rect != null){
                    endX = rect.left + (rect.width - main.width) / 2;
                    endY = rect.top - main.height + 5;
                    posSprite.x = rect.left + ( rect.width) / 2;
                }

            }
        }

        posSprite.y = endY + main.height - 12;
        if(endX < 0){
            endX = 0;
        }
        if(endX + main.width > RV.NowMap.getData().width * RV.NowProject.blockSize){
            endX = RV.NowMap.getData().width * RV.NowProject.blockSize - main.width;
        }
        main.x = endX;
        main.y = endY;
        mainDraw.x = endX;
        mainDraw.y = endY;
        name.x = main.x;
        name.y = main.y - 24;
        nameDraw.x = name.x;
        nameDraw.y = name.y;
    }

    /**
     * Main draw
     */
    this.update = function(){
        if(!isStart){
            return;
        }
        updatePoint();
        if(showText == null || showText.length <= 0){
            return;
        }
        if(pass){
            if(RF.IsNext()){
                IInput.up = false;
                pass = false;
            }
            return;
        }
        if(RF.IsNext()){
            IInput.up = false;
            this.isDrawAll = true;
            return;
        }
        if(wait > 0){
            wait -= 1;
            return;
        }

        if(speedTmp > 0){
            speedTmp -= 1;
            return;
        }else{
            speedTmp = speed;
        }

        while (true) {
            if(showText.length <= 0){
                break;
            }
            var min = showText.substring(0,1);
            showText = showText.substring(1,showText.length);
            var c = min.charCodeAt(0);
            if(c == 60000){//换行
                dy += (IFont.getHeight(min, fontSize) * 1.2);
                dx = 10;
            }else if(c == 60001){//改变颜色
                var returnS = TextToTemp(showText,"[","]","\\[([0-9]+[，,][0-9]+[，,][0-9]+)]");
                color = new IColor(returnS[0]);
                showText = returnS[1];
            }else if(c == 60002){//改变字号
                returnS = TextToTemp(showText , "[","]","\\[([0-9]+)]");
                fontSize = parseInt(returnS[0]);
                showText = returnS[1];
            }else if(c == 60100){
                // showText = RV.User.name + showText;
                break;
            }else if(c == 60101){//全部显示
                this.isDrawAll = true;
            }else if(c == 60102){//等待10帧
                wait = 10;
                break;
            }else if(c == 60103){//等待20帧
                wait = 20;
                break;
            }else if(c == 60104){//等待指定
                returnS = TextToTemp(showText , "[","]","\\[([0-9]+)]");
                wait = parseInt(returnS[0]);
                showText = returnS[1];
                break;
            }else if(c == 60105){//去往下段对话
                this.isNext = true;
                break;
            }else if(c == 60106){//暂停
                pass = true;
                break;
            }else if(c == 60003){//显示变量
                returnS = TextToTemp(showText , "[","]","\\[([a-zA-Z0-9-_]+)]");
                showText = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
            }else {
                mainDraw.drawTextQ(min, dx, dy, color, fontSize);

                if(showText.length > 0){
                    var next_m = showText.substring(0,1);
                    var next_w = 0;

                    if(noLatin){
                        next_w = IFont.getWidth(next_m, fontSize);
                    }else{
                        var num_index = showText.search("[ ,.!?:]");
                        if(num_index >= 0){
                            next_w = IFont.getWidth(showText.substr(0,num_index),fontSize);
                        }else{
                            next_w = IFont.getWidth(showText,fontSize);
                        }
                        if(next_w > mainDraw.width - 20) next_w = IFont.getWidth(next_m, fontSize);
                    }

                    dx += IFont.getWidth(min,fontSize);
                    if(dx + next_w >= mainDraw.width -10){
                        dx = 10;
                        dy += (IFont.getHeight(min, fontSize) * 1.2);

                    }
                }
            }
            if(!this.isDrawAll){
                break;
            }
        }
        mainDraw.updateBitmap();
    };

       /**
      * Text regular extraction
      * @param mainText | The string to be extracted
      * @param s | leading special sign
      * @param e | back special sign
      * @param rex | regular expression
      * @returns {* []} Extracted content
     */
    function TextToTemp( mainText, s, e, rex){
        var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
        mainText = mainText.substring(tmp.length + s.length + e.length, mainText.length);
        var temp1 = tmp.replaceAll(rex, "$1");
        var temp_2 = temp1.replaceAll(" ", "");
        var temp_e = temp_2.replaceAll("，", ",");
        return [temp_e,mainText];
    }

    /**
     * Dispose
     */
    this.dispose = function(){
        posSprite.dispose();
    };

}/**
 * Created by Yitian Chen on 2019/4/17.
 * Logic of damage number
 * @param type | type 0、general damage 1、Critical Damage 2、MP Cost 3、MISS
 * @param num | number
 * @param view | viewport 
 * @param x | x coordinate
 * @param y | y coordinate
 */
function LNum(type,num,view,x,y){

    var _sf = this;
    var sprite = null;
    var bitmap = null;

    this.endDo = null;
    if(type == 0 || type == 1){//HP
        if(num >= 0){//damage
            if(type == 1){//Crit
                bitmap = RV.NumberPics[3];
            }else{//normal
                bitmap = RV.NumberPics[0];
            }
        }else if(num < 0){//heal HP
            bitmap = RV.NumberPics[1];
        }
    }else if(type == 2){//MP Cost
        bitmap = RV.NumberPics[2];
    }else if(type == 3){//miss
        bitmap = RV.NumberPics[4];
    }

    if(bitmap != null){
        if(type == 3){
            sprite = new ISprite(bitmap,view);
            sprite.z = 400;
            sprite.x = x;
            sprite.y = y;
            sprite.speedY = -1 * rand(3,5);
            sprite.speedX = rand(1,2);
            sprite.aSpeedY = 0.3;
            sprite.fadeTo(0,80);
            sprite.setOnEndFade(function(){
                sprite.disposeMin();
                if(_sf.endDo != null) _sf.endDo();
            });
            return;
        }

        var minW = parseInt(bitmap.width / 10);
        var minH = parseInt(bitmap.height);

        num = Math.abs(num);
        num = parseInt(num);
        var s = num + "";
        var ary = s.split("");
        var w = s.length;
        sprite = new ISprite(IBitmap.CBitmap(w * minW,minH) , view);
        sprite.z = 400;
        for(var i = 0;i<ary.length;i++){
            var n = parseInt(ary[i]);
            var bCof = new IBCof(bitmap , n * minW , 0 , minW , minH);
            sprite.drawBitmapBCof(i * bCof.width,0,bCof,false);
        }

        sprite.x = x;
        sprite.y = y;
        sprite.speedY = -1 * rand(3,5);
        sprite.speedX = rand(1,2);
        sprite.aSpeedY = 0.3;
        sprite.fadeTo(0,80);
        sprite.setOnEndFade(function(){
            sprite.disposeMin();
            if(_sf.endDo != null) _sf.endDo();
        });
    }

}/**
 * Created by Yitian Chen on 2019/4/8.
 * Logic of Particle
 * @param res | resource ID
 * @param view | viewport
 * @param isSingle | play one time or not
  * @param actor | target actor
 * @param rect | target rectangle
 * @constructor
 */
function LParticle(res,view,isSingle,actor,rect){
    var _sf = this;
    //Relative motion area
    this.userRect = rect;
    //data
    var data = res;
    //load images of particle
    var bitmaps = [];
    for(var i = 0;i<data.files.length;i++){
        bitmaps[i] = RF.LoadCache("Animation/" + data.files[i]);
    }
    //number of particle
    var num = data.number;
    this.line = data.distance;
    this.dir = data.dir;

    //rectangle of particle
    this.rect = new IRect(0, 0, data.width, data.height);
    this.radii = data.radius;
    this.x = 0;
    this.y = 0;
    //gravity
    this.isG = data.isGravity;
    //end callback
    this.endDo = null;
    this.tag   = null;

    var playOne = isSingle;
    var endPlay = false;


    var type = data.launchType;
    var time = data.time;

    var pos = 0;
    var sprites = [];
    if(bitmaps.length > 0){
        sprites = new Array(num);
        for (i = 0; i < num; i++) {
            if(bitmaps[pos] != null) {
                sprites[i] = new ISprite( bitmaps[pos] , view);
                sprites[i].x = this.rect.left + rand(0, this.rect.width);
                sprites[i].y = this.rect.top + rand(0, this.rect.height);
                sprites[i].z = 500;
                sprites[i].opacity = 0;
                pos = i % bitmaps.length;
            }
        }
    }


    data.sound.play();

    /**
     * Main update
     */
    this.update = function() {
        if (sprites == null) return;
        if(data.point.type == 0){
            this.pointUpdate();
        }
        var noneCount = 0;
        for (var i = 0; i < sprites.length; i++) {
            if (sprites[i] == null) continue;
            if (sprites[i].opacity > 0) {
                if(sprites[i].tag == null) {
                    sprites[i].opacity = 0;
                    return;
                }else {
                    var temp = sprites[i].tag;
                    sprites[i].opacity -= temp[0];
                    sprites[i].x += temp[1];
                    sprites[i].y += temp[2];
                    if (this.isG) {
                        temp[2] += 0.1;
                    }
                }
            } else {
                if(sprites[i].tag != null && sprites[i].opacity <= 0 && playOne) {
                    noneCount += 1;
                    continue;
                }
                if (type == 1) {
                    var ftime = (time / 2) + rand(0, time);
                    sprites[i].opacity = 1.0;
                    var difO = 1.0 / (ftime * 1.0);

                    var difX = 0;
                    var difY = 0;
                    sprites[i].x = this.rect.left + rand(0, this.rect.width);
                    sprites[i].y = this.rect.top + rand(0, this.rect.height);
                    sprites[i].zoomX = sprites[i].zoomY = 1.0 - 0.5 * Math.random();
                    switch (this.dir) {
                        case 0:
                            difY = ((sprites[i].y - this.line) - sprites[i].y) / (ftime * 1.0);
                            break;
                        case 1:
                            difY = ((sprites[i].y + this.line) - sprites[i].y) / (ftime * 1.0);
                            break;
                        case 2:
                            difX = ((sprites[i].x - this.line) - sprites[i].x) / (ftime * 1.0);
                            break;
                        case 3:
                            difX = ((sprites[i].x + this.line) - sprites[i].x) / (ftime * 1.0);
                            break;
                    }
                    sprites[i].tag = [difO, difX, difY];
                } else if (type == 0) {
                    var d = rand(0, 360);
                    var angle = Math.PI * (d * 1.0) / 180.0;
                    var endX = this.x + parseInt(Math.cos(angle) * this.radii);
                    var endY = this.y + parseInt(Math.sin(angle) * this.radii);
                    sprites[i].opacity = 1.0;
                    sprites[i].angle = rand(0, 360);
                    ftime = (time / 2) + rand(0, time);

                    difO = 1.0 / (ftime * 1.0);
                    difX = (endX - this.x) / (ftime * 1.0);
                    difY = (endY - this.y) / (ftime * 1.0);
                    sprites[i].x = this.x;
                    sprites[i].y = this.y;
                    sprites[i].zoomX = sprites[i].zoomY = 1.0 - 0.* Math.random();
                    sprites[i].tag = [ difO, difX, difY ];
                }
            }
        }
        if(noneCount >= sprites.length - 1 && playOne && this.endDo != null){
            this.endDo();
            this.endDo = null;
        }

    };

    /**
     * update position
     */
    this.pointUpdate = function(){
        var x = 0;
        var y = 0;
        var point = data.point;
        if(point.type === 0){//Relative coordinates

            var rect = null;
            if(actor != null){
                rect = actor.getUserRect();
            }else if(_sf.userRect != null){
                rect = _sf.userRect;
            }else{
                rect = new IRect(1,1,1,1);
            }

            if(point.dir === 0){//center
                x = rect.x + rect.width / 2;
                y = rect.y + rect.height / 2;
            }else if(point.dir === 1){//top
                x = rect.x + rect.width / 2;
                y = rect.y;
            }else if(point.dir === 2){//bottom
                x = rect.x + rect.width / 2;
                y = rect.bottom;
            }else if(point.dir === 3){//left
                x = rect.x;
                y = rect.y + rect.height / 2;
            }else if(point.dir === 4){//right
                x = rect.right;
                y = rect.y + rect.height / 2;
            }else if(point.dir === 5){//Screen
                x = 0;
                y = 0;
            }

        }else{//Absolute coordinates
            x = point.x;
            y = point.y;
        }
        if(type === 0){
            this.x = x;
            this.y = y;

        }else{
            var w = this.rect.width;
            var h = this.rect.height;
            this.rect.left = x - w / 2 ;
            this.rect.top = y - h / 2 ;
            this.rect.right = this.rect.left + w;
            this.rect.bottom = this.rect.top + h;
        }

    };

    this.pointUpdate();

    /**
     * Dispose
     */
    this.dispose = function(){
        if(sprites == null) return;
        for (var i = 0; i < sprites.length; i++) {
            sprites[i].disposeMin();
        }
        sprites = null;
    };

    /**
     * Get rectangle
     * @returns {IRect}
     */
    this.getRect = function(){
        return new IRect(this.x,this.y,1,1);
    }



}/**
 * Created by Yitian Chen on 2018-2-9.
 * Special weather particle effect
 * @param bmps | image of particle
 * @param num | number of particle
 * @param z | layer z
 * @param vp | viewport
 */
function LPetal(bmps, num, z, vp){
    var sps = [];

    if(bmps.length <= 0) return;
    for (var i = 0; i < num; i++) {
        sps[i] = new ISprite(bmps[rand(0,bmps.length - 1)]);
        sps[i].z = z + i;
        sps[i].zoomX = sps[i].zoomY = 0.1 + (0.2 * (rand(0,100) * 1.0 / 100.0));
        sps[i].x = -50 - rand(0,RV.NowProject.gameWidth);
        sps[i].y = -100 + rand(0,150);
        sps[i].startRotate((rand(0,100) * 1.0 / 100.0));
        sps[i].tag = [20+rand(0,200),10+rand(0,100)];
    }

    this.update = function(){
        for (var i = 0; i < sps.length; i++) {
            var speed = sps[i].tag;
            var speedx = speed[0] * 1.0 / 100;
            var speedy = speed[1] * 1.0 / 100;
            sps[i].x += speedx;
            sps[i].y += speedy;
            if(sps[i].x > RV.NowProject.gameWidth || sps[i].y > RV.NowProject.gameHeight){
                sps[i].zoomX = sps[i].zoomY = 0.1 + (0.2 * (rand(0,100) * 1.0 / 100.0));
                sps[i].x = -50 - rand(0,RV.NowProject.gameWidth);
                sps[i].y = -100 + rand(0,150);
                sps[i].startRotate((rand(0,100) * 1.0 / 100.0));
                sps[i].tag = [20+rand(0,200),10+rand(0,100)];
            }
        }
    };

    this.dispose = function(){
        for (var i = 0; i < sps.length; i++) {
            sps[i].disposeMin();
        }
    }
}

LPetal.Play = function(bmps, zoomMin, zoomMax, time){
    var num = 40;
    for (var i = 0; i < num; i++) {
        if(LPetal.disSps[i] == null){
            LPetal.disSps[i] = new ISprite(bmps[rand(0,bmps.length)]);
            LPetal.disSps[i].z = 99999 + i;
        }
        LPetal.disSps[i].zoomX = LPetal.disSps[i].zoomY = zoomMin + (zoomMax * (rand(0,100) * 1.0 / 100.0));
        LPetal.disSps[i].x = -50 - rand(0,300);
        LPetal.disSps[i].y = rand(0,300);
        LPetal.disSps[i].startRotate((rand(0,100) * 1.0 / 100.0));
        var endy = rand(0,800);
        var timeNew =  (time + time * rand(0,300) / 100.0);
        LPetal.disSps[i].slideTo(550, endy,timeNew);
        LPetal.disSps[i].scaleTo(LPetal.disSps[i].zoomX * 0.5, LPetal.disSps[i].zoomX * 0.5, timeNew);
    }
};

LPetal.disSps = [];
/**
 * Created by Yitian Chen on 2019/5/28.
 * Logic of Skill
 * @param actor | LActor
 * @param data | Configuration Data
 * @param user | target object
 */
function LSkill(actor , data , user) {
    //Process
    //1、In the casting step, if there is no casting animation, there is no casting action (can be interrupted during casting)
    //2、In the skill preparation step, it executes common triggers, prepares to lock direction, super armor, dispose area, and etc.
    //3、In the beginning step, it plays animation，executes common triggers, and settles the corresponding damage.
    //4、Restore the skill state at the end of the skill

    var _sf = this;
    var cof = data;
    var isSelf = actor === RV.NowMap.getActor();
    var char = actor.getCharacter();

    var step = 0;//0 casting  1 preparation  2 beginning 3 end
    var stepWait = 0;

    var oldFixedOrientation = false;

    var rectSprite = null;

    var throwTimes = cof.launchTimes;
    var throwInterval = 0;

    var nowMoveTime = cof.moveTime;

    var chantAnim = false ;
    var chantAction = false;
    var selecting = false;
    var selectime = 120;

    var overAnim = false;
    var overMove = false;

    var doing = false;

    var userRect = new IRect(1,1,1,1);

    this.endDo = null;

    //Shooting coordinates, please ensure that you have set Muzzle in the shooting skills.
    var throwX = 0;
    var throwY = 0;

    //Basic damage calculation
    var hurt = cof.pow;
    hurt += cof.pow * (user.getMaxHP() / 9999) * (cof.maxHP / 100);
    hurt += cof.pow * (user.getMaxMp() / 9999) * (cof.maxHP / 100);
    hurt += cof.pow * (user.hp / user.getMaxHP()) * (cof.Hp / 100);
    hurt += cof.pow * (user.mp / user.getMaxMp()) * (cof.Mp / 100);
    hurt += cof.pow * (user.getWAtk() / 999) * (cof.watk / 100);
    hurt += cof.pow * (user.getWDef() / 999) * (cof.wdef / 100);
    hurt += cof.pow * (user.getMAtk() / 999) * (cof.matk / 100);
    hurt += cof.pow * (user.getMDef() / 999) * (cof.mdef / 100);
    hurt += cof.pow * (user.getSpeed() / 999) * (cof.speed / 100);
    hurt += cof.pow * (user.getLuck() / 999) * (cof.luck / 100);
    stepChant();

    //whether there are other skills
    if(actor.nowSkill != null){
        actor.nowSkill.setStep(3);
        actor.nowSkill.update();
        actor.nowSkill = null;
    }
    actor.nowSkill = this;
    /**
     * Final calculation of injury
     * @param ele | Data belong to
     * @returns {*}
     */
    this.endHurt = function(ele){
        var damage = hurt;
        var attributeNum = {atk : 1,def:0};
        if(isSelf){
            if(ele !== RV.GameData.actor){
                attributeNum = RV.GameData.actor.getAttribute(ele.getData().attributeId);
            }
        }else{
            attributeNum = user.getAttribute();
        }
        if(damage > 0){
            damage *= ((999 - (ele.getMDef() / 2)) / 999);
            damage = Math.max(1,damage) * attributeNum.atk - Math.max(1,damage) * attributeNum.def;
        }else if(damage < 0){
        }else{
            damage = 0;
        }

        var d1 = damage * ((100 - cof.dispersed) / 100);
        var d2 = damage * ((100 + cof.dispersed) / 100);
        return rand(Math.floor(d1),Math.ceil(d2));
    };

    /**
     * Main update
     */
    this.update = function(){
        if(step === 0 && chantAction && chantAnim){
            stepPrepare();
        }else if(step == 1 && cof.userType == 2){//preparation step
            stepWait += 1;
            if(stepWait > 999){
                log("if it stops for a long time in the preparation step, please check whether the bullet muzzle is set");
                step = 2;
                stepWait = 0;
            }
        }else if(step === 2){//loop of beginning step
            if(overMove && overAnim){
                step = 3;
            }
            if(cof.selectRect && !selecting && cof.userType >= 3){
                selectime -= 1;
                if(selectime <= 0){
                    selecting = true;
                    userRect = rectSprite.GetRect();
                    rectSprite.fadeTo(0,20);
                }
                if(rectSprite != null){
                    if(isSelf){
                        if(IInput.isKeyPress(RC.Key.left)){
                            rectSprite.x -= 5;
                        }
                        if(IInput.isKeyPress(RC.Key.right)){
                            rectSprite.x += 5;
                        }
                        if(IInput.isKeyPress(RC.Key.up)){
                            rectSprite.y -= 5;
                        }
                        if(IInput.isKeyPress(RC.Key.down)){
                            rectSprite.y += 5;
                        }
                    }else{
                        if(rectSprite.x > RV.NowMap.getActor().getCharacter().x){
                            rectSprite.x -= 5;
                        }
                        if(rectSprite.x < RV.NowMap.getActor().getCharacter().x){
                            rectSprite.x += 3;
                        }
                        if(rectSprite.y > RV.NowMap.getActor().getCharacter().y){
                            rectSprite.y -= 3;
                        }
                        if(rectSprite.y < RV.NowMap.getActor().getCharacter().y){
                            rectSprite.y += 3;
                        }
                    }

                }
                return;
            }
            if(cof.userType === 1 && !doing ){//actor
                userSkill(actor , user);
                RV.NowCanvas.playAnim(cof.triggerAnim , function(){
                    overAnim = true;
                } , actor , true);
                doing = true;
            }else if(cof.userType === 2){//bullet of Throwing-skill
                if(throwTimes > 0){
                    if(throwInterval > 0){
                        throwInterval -= 1;
                    }
                }else{
                    overAnim = true;
                }
            }else if( cof.userType === 3  && !doing ){//1 nearest enemy in scope
                var camp = actor.camp == 1 ? 2 : 1;
                var needActor = actor.camp == 1;
                var tempEnemy = getNeedEnemys(0,camp , needActor , false);
                if(tempEnemy != null){
                    doSkill(tempEnemy);
                }else{
                    overAnim = true;
                }
                doing = true;
            }else if( cof.userType === 4 && !doing ){//1 random enemy in scope
                camp = actor.camp == 1 ? 2 : 1;
                needActor = actor.camp == 1;
                tempEnemy = getNeedEnemys(1,camp , needActor , false);
                if(tempEnemy != null){
                    doSkill(tempEnemy);
                }else{
                    overAnim = true;
                }
                doing = true;
            }else if(cof.userType === 5 && !doing ){//All enemies in scope
                camp = actor.camp == 1 ? 2 : 1;
                needActor = actor.camp == 1;
                var tempEnemys = getNeedEnemys(2,camp , needActor , false);
                for(var i = 0;i<tempEnemys.length;i++){
                    tempEnemy = tempEnemys[i];
                    if(tempEnemy != null){
                        doSkill(tempEnemy);
                    }
                }
                if(tempEnemys.length <= 0){
                    overAnim = true;
                }
                doing = true;
            }else if( cof.userType === 6  && !doing ){//1 nearest team member in scope
                camp = actor.camp == 1 ? 1 : 2;
                needActor = actor.camp == 2 || actor.camp == 0;
                tempEnemy = getNeedEnemys(0,camp , needActor , false);
                if(tempEnemy != null){
                    doSkill(tempEnemy);
                }else{
                    doSkill(actor);
                }
                doing = true;
            }else if( cof.userType === 7 && !doing ){//1 random team member in scope
                camp = actor.camp == 1 ? 1 : 2;
                needActor = actor.camp == 2 || actor.camp == 0;
                tempEnemy = getNeedEnemys(1,camp , needActor , true);
                if(tempEnemy != null){
                    doSkill(tempEnemy);
                }else{
                    overAnim = true;
                }
                doing = true;
            }else if(cof.userType === 8 && !doing ){//All team members in scope
                camp = actor.camp == 1 ? 1 : 2;
                needActor = actor.camp == 2 || actor.camp == 0;
                tempEnemys = getNeedEnemys(2,camp , needActor , true);
                for(i = 0;i<tempEnemys.length;i++){
                    tempEnemy = tempEnemys[i];
                    if(tempEnemy != null){
                        doSkill(tempEnemy);
                    }
                }
                if(tempEnemys.length <= 0){
                    overAnim = true;
                }
                doing = true;
            }

            if(nowMoveTime <= 0){
                overMove = true;
                doing = true;
            }else{
                actor.Speed[1] = cof.moveX * (actor.getDir() === 0 ? 1 : -1);
                actor.Speed[0] = cof.moveY;
                if(nowMoveTime % cof.launchInterval == 0){
                    doing = false;
                }
                updateUserRect();
                nowMoveTime -= 1;
            }
        }else if(step === 3){//end step
            char.fixedOrientation = oldFixedOrientation;
            actor.actionLock = false;
            actor.skillChant = false;
            actor.getCharacter().reSingleTime();
            actor.superArmor = false;
            actor.nowSkill = null;
            char.shootCall = null;
            if(this.endDo != null){
                this.endDo();
                this.dispose();
            }
        }
    };

    /**
     * does skill
     * @param enemy
     */
    function doSkill(enemy){
        if(enemy instanceof LEnemy){
            userSkill(enemy.getActor() , enemy);
            RV.NowCanvas.playAnim(cof.triggerAnim , function(){
                overAnim = true;
            } , enemy.getActor() , true);
        }else if(enemy instanceof LActor){
            userSkill(enemy , RV.GameData.actor);
            RV.NowCanvas.playAnim(cof.triggerAnim , function(){
                overAnim = true;
            } , enemy , true);
        }

    }

    /**
     * Get enemy or actor you need
     * @param type | type of Scope 0 "1 nearest enemy in scope" 1 "1 random enemy in scope" 2"All enemies in scope"
     * @param camp | enemy camp
     * @param needActor | Whether to filter actor or not
     * @param needSelf | Whether to filter themselves
     * @returns {*}
     */
    function getNeedEnemys(type,camp,needActor,needSelf){
        var tempEnemy = null;
        var tempEnemys = [];
        var enemys = RV.NowMap.getEnemys();
        var dis = 999999;
        for(var i = 0;i<enemys.length;i++){
            if(!needSelf && enemys[i] == user){
                continue;
            }
            var tempRect = enemys[i].getActor().getUserRect();
            //enemy within the scope
            if(enemys[i].getActor().camp == camp &&!enemys[i].isDie && enemys[i].visible && userRect.intersects(tempRect)){
                if(type == 0){
                    //Calculate the distance between two points
                    var tempDis = Math.abs( Math.sqrt( Math.pow((char.x - tempRect.centerX),2) + Math.pow((char.y - tempRect.centerY),2) ) );
                    if(tempDis < dis){
                        dis = tempDis;
                        tempEnemy = RV.NowMap.getEnemys()[i];
                    }
                }else{
                    //enemy within the scope
                    if(enemys[i].getActor().camp == camp &&!enemys[i].isDie && enemys[i].visible && userRect.intersects(tempRect)){
                        tempEnemys.push(RV.NowMap.getEnemys()[i]);
                    }
                }

            }
        }

        if(needActor){
            tempRect = RV.NowMap.getActor().getUserRect();
            if(type == 0 && userRect.intersects(tempRect)){
                tempDis = Math.abs( Math.sqrt( Math.pow((char.x - tempRect.centerX),2) + Math.pow((char.y - tempRect.centerY),2) ) );
                if(tempDis < dis){
                    tempEnemy = RV.NowMap.getActor();
                }
            }else{
                tempRect = RV.NowMap.getActor().getUserRect();
                if(userRect.intersects(tempRect)){
                    tempEnemys.push(RV.NowMap.getActor());
                }

            }
        }

        if(type == 0){
            return tempEnemy;
        }else if(type == 1){
            return RF.RandomChoose(tempEnemys);
        }else if(type == 2){
            return tempEnemys;
        }
    }

    /**
     * value and state effect of skill
     * @param cactor | target LActor
     * @param user | target GActor / LEnemy
     */
    function userSkill(cactor,user){
        handleHPMP(cactor , _sf.endHurt(user)  , 0);

        //BUFF
        for(var id in cof.cState){
            if(cof.cState[id] === 1){
                user.addBuff(id);
            }else if(cof.cState[id] === 2){
                user.subBuff(id);
            }
        }
    }

    /**
     * damage result
     * @param actor | target actor
     * @param addHp | damage of hp
     * @param addMp | damage of mp
     */
    function handleHPMP(oactor,addHp,addMp){
        if(addHp == 0 && addMp == 0) return;
        if(addMp != 0){
            oactor.injure(4 , addMp * -1);
        }
        if(addHp != 0){
            var obj = {
                crit : false,
                damage : addHp,
                repel : cof.repel,
                dir : actor.getDir(),
                fly : cof.fly
            };
            oactor.injure(2, obj);
        }
    }

    /**
     * Get shooter
     * @returns {{repel: *, fly: (*|number), dir: number}}
     */
    this.getBulletObj = function(){
        return {
            repel : cof.repel,
            dir : actor.getDir(),
            fly : cof.fly
        }
    };
    /**
     * Dispose
     */
    this.dispose = function(){
        if(rectSprite != null){
            rectSprite.dispose();
        }
    };

    //casting step
    function stepChant(){
        step = 0;
        actor.skillChant = true;
        char.setAction(cof.readyAction , false , true , false);
        char.actionCall = function(){
            char.actionCall = null;
            char.reSingleTime();
            chantAction = true;
        };
        if(cof.readyAction === 0){
            chantAction = true;
        }
        RV.NowCanvas.playAnim(cof.userAnim , function(){
            actor.skillChant = false;
            chantAnim = true;
        } , actor,true);
    }

    function updateUserRect(){
        //set scope of skill
        var x = char.x;
        var y = char.y;
        if(actor.getDir() === 0){
            userRect.x = x + cof.triggerX * RV.NowProject.blockSize;
            userRect.y = y + cof.triggerY * RV.NowProject.blockSize;
            userRect.width = cof.triggerWidth * RV.NowProject.blockSize;
            userRect.height = cof.triggerHeight * RV.NowProject.blockSize;
        }else{
            userRect.right = x - (cof.triggerX - 1) * RV.NowProject.blockSize;
            userRect.y = y + cof.triggerY * RV.NowProject.blockSize;
            userRect.left = userRect.right - cof.triggerWidth * RV.NowProject.blockSize;
            userRect.height = cof.triggerHeight * RV.NowProject.blockSize;
        }
    }

    //preparation step
    function stepPrepare(){
        step = 1;
        //execute common trigger
        var trigger = RV.NowSet.findEventId(cof.eventId);
        if(trigger != null){
            trigger.doEvent();
        }
        //lock direction
        if(cof.lockDirection){
            oldFixedOrientation = char.fixedOrientation;
            char.fixedOrientation = true;
        }
        //super armor
        if(cof.superArmor){
            actor.superArmor = true;
        }
        updateUserRect();
        if(cof.selectRect && cof.userType >= 3 ){
            rectSprite = new ISprite(IBitmap.CBitmap(parseInt(userRect.width) , parseInt(userRect.height)),RV.NowMap.getView());
            if(isSelf){
                rectSprite.drawRect(new IRect(0,0,rectSprite.width,rectSprite.height),new IColor(255,125,125,125));
            }else{
                rectSprite.drawRect(new IRect(0,0,rectSprite.width,rectSprite.height),new IColor(125,255,125,125));
            }

            actor.stiffTime = selectime;

            rectSprite.z = 500;
            rectSprite.x = userRect.x;
            rectSprite.y = userRect.y;
        }
        //set action of move
        actor.actionLock = true;
        if(cof.doAction !== 0){

            if(cof.userType == 2){
                char.shootCall = function(points){
                    if(throwInterval > 0) return;
                    for(var i = 0;i<points.length;i++){
                        var p = char.getCenterPoint();
                        var x = p[0] + points[i].x;
                        if(actor.getDir() == 1){
                            x = p[0] - points[i].x;
                        }
                        var y = p[1] + points[i].y;
                        RV.NowCanvas.playBullet(cof.bullet , actor , x , y , {value1:100 , value2:0, buff:cof.cState , skill : _sf});
                    }
                    throwInterval = cof.launchInterval;
                    throwTimes -= 1;
                    if(throwTimes <= 0) char.shootCall = null;
                };
            }

            char.setAction(cof.doAction , false , cof.userType != 2 , false , true);
        }
       //beginning step
        step = 2;
    }

    this.setStep = function(index){
        step = index;
    };

    this.stopSkill = function(){
        if(cof.superArmor) return false;
        //Casting can be interrupted at any time
        if(step < 2){
            step = 3;
        }else if(step == 2){
            step = 3;
        }
        return true;
    }
}/**
 * Created by Yitian Chen on 2019/3/17.
 * Trigger operation logic
 * @param trigger | data of trigger
 * @param view | viewport
 * @param mdata | block
 * @param blocks | Interactive Block
 * @param mapdata | map data
 */
function LTrigger(trigger , view , mdata , blocks , mapdata){

    var _sf = this;

    var data = trigger;
    this.id = trigger.id;
    this.name = trigger.name;
    this.entity = false;
    var char = null;

    var pageIndex = -1;
    var tempPageIndex = -1;
    var nowPage = null;

    var doEnd = false;

    var rect = null;

    var icon = new ISprite(RF.LoadCache("System/icon_event.png"),view);
    var keyStr = RC.CodeToSting(RC.Key.ok);
    if(IsPC()){
        icon.drawTextQ(keyStr , (icon.width - IFont.getWidth(keyStr,14)) / 2 ,7,IColor.Black(),14);
    }else{
        icon.drawTextQ("Touch" , (icon.width - IFont.getWidth(keyStr,12)) / 2 ,7,IColor.Black(),12);
    }

    icon.visible = false;

    this.getSwitch = function(index){
        if(RV.GameData.selfSwitch[RV.NowMap.id] == null){
            return false;
        }
        if(RV.GameData.selfSwitch[RV.NowMap.id][_sf.id] == null){
            return false;
        }
        return RV.GameData.selfSwitch[RV.NowMap.id][_sf.id][index];
    }

    inspectPage();

    /**
     * Main update
     */
    this.update = function(){
        if(char != null) {
            char.update();
            _sf.updateIconPoint();
        }
        inspectPage();
        doTrigger();
    };

    /**
     * update the position of icon
     */
    this.updateIconPoint = function(){
        var nowRect = null;
        if(char != null){
            nowRect = char.getCharacter().getCharactersRect();
        }else{
            nowRect = rect;
        }
        icon.x = nowRect.left + (nowRect.width - icon.width) / 2;
        icon.y = nowRect.top - icon.height + 5;
    };

    /**
     * dispose
     */
    this.dispose = function(){
        if(char != null) char.dispose();
        icon.disposeMin();
    };

    /**
     * get LActor
     * @returns {*}
     */
    this.getCharacter = function(){
        return char;
    };
    /**
     * get decision rectangle
     * @returns {*}
     */
    this.getRect = function(){
        return rect;
    };

    /**
     * get trigger direction
     */
    this.getDir = function(){
        return char.getDir();
    };

    /**
     * Execute the content of trigger
     */
    function doTrigger(){
        if(nowPage == null) return;
        if(nowPage.type == 0 && !doEnd){//Execute the event
            addTrigger();
        }else if(nowPage.type == 1 && !doEnd && rect != null && RV.NowMap.getActor().getCharacter().isContactFortRect(rect)){
            addTrigger();
        }else if(nowPage.type == 2 && !doEnd  && rect != null && RV.NowMap.getActor().getCharacter().isContactFortRect(rect)){
            icon.visible = true;
            if( IInput.isKeyDown(RC.Key.ok) || IVal.scene.getCtrl(0).isAtkClick || (IInput.down && (IInput.x >= (view.ox + rect.left) &&
                IInput.y >= (view.oy + rect.top) && IInput.x < (view.ox + rect.right) && IInput.y < (view.oy + rect.bottom) ) )){
                addTrigger();
                IVal.scene.getCtrl(0).isAtkClick = false;
            }
        }else{
            icon.visible = false;
        }
    }

    /**
     * Execute
     */
    function addTrigger(){
        RV.NowEventId = _sf.id;
        if(nowPage.isParallel && RF.FindOtherEvent(_sf) == null ){
            RF.AddOtherEvent(nowPage.events,_sf,_sf.id);
            doEnd = !nowPage.loop;
        }else if(!nowPage.isParallel && RV.InterpreterMain.isEnd){
            RV.InterpreterMain.addEvents(nowPage.events);
            RV.InterpreterMain.NowEventId = _sf.id;
            doEnd = !nowPage.loop;
        }
    }

    /**
     * Check the trigger page that can be executed currently
     */
    function inspectPage(){
        for(var i = data.page.length - 1;i >= 0;i--){
            if(data.page[i].logic.tag == null){
                data.page[i].logic.tag = _sf;
            }
            if(i != tempPageIndex && data.page[i].logic.result()){
                pageIndex = i;
                tempPageIndex = pageIndex;
                repaintPage();
                return;
            }
            if(i == tempPageIndex && data.page[i].logic.result()){
                return;
            }
        }
        if(char != null){
            char.dispose();
            char = null;
        }
        tempPageIndex = -1;
        nowPage = null;
        rect = null;
    }

    /**
     * update pages of trigger
     */
    function repaintPage(){

        nowPage = data.page[pageIndex];
        var oldX = data.x * RV.NowProject.blockSize;
        var oldY = data.y * RV.NowProject.blockSize;
        if(char != null){
            oldX = char.getCharacter().x;
            oldY = char.getCharacter().y;
            char.dispose();
            char = null;
        }else if(rect != null){
            oldX = rect.x;
            oldY = rect.y;
        }
        var image = nowPage.image;
        if(image.id != -1){
            char = new LActor(view , 0 , 0 , mdata , blocks , oldX, oldY, image.id,180);
            char.IsGravity = nowPage.gravity == 0;
            char.GravityNum = (RV.GameData.gravityNum / 100) * mapdata.gravity;
            var character = char.getCharacter();
            character.CanPenetrate = nowPage.penetration == 0;
            character.setLeftRight(image.dir == 0);
            character.setAction(image.actionIndex);
            character.fixedOrientation = image.fixedOrientation;
            char.actionLock = image.fixedAction;
            character.getSpirte().opacity = image.opacity / 255;
            rect = character.getCharactersRect();
            _sf.entity = image.entity;
        }else{
            rect = new IRect(oldX,oldY,oldX + RV.NowProject.blockSize,oldY + RV.NowProject.blockSize);
        }

        icon.x = rect.left + (rect.width - icon.width) / 2;
        icon.y = rect.top - icon.height + 5;
        icon.z = 1100;

        doEnd = false;
    }

    this.updateGravityNum = function(){
        if(char == null) return;
        char.GravityNum = (RV.GameData.gravityNum / 100) * mapdata.gravity;
        char.Speed[0] = 0;
    };

    this.getUserRect = function(){
        if(char != null){
            return char.getUserRect();
        }else if(rect != null){
            return rect;
        }else{
            return new IRect(data.x * RV.NowProject.blockSize,data.y * RV.NowProject.blockSize,
                data.x * RV.NowProject.blockSize + RV.NowProject.blockSize,
                data.y * RV.NowProject.blockSize + RV.NowProject.blockSize);
        }
    };

    this.save = function(){
        var gravity = false;
        var actionLock = false;
        var fixedOrientation = false;
        var dir = 0;
        var opacity = 1;
        var CanPenetrate = false;
        var x = data.x * RV.NowProject.blockSize;
        var y = data.y * RV.NowProject.blockSize;
        var end = doEnd;
        if(char != null){
            gravity = char.IsGravity;
            actionLock = char.actionLock;
            dir = char.getDir();
            var chars = char.getCharacter();
            if(chars != null){
                fixedOrientation = chars.fixedOrientation;
                CanPenetrate = chars.CanPenetrate;
                if(chars.getSpirte() != null){
                    opacity = chars.getSpirte().opacity;
                }
                x = chars.x;
                y = chars.y;
            }
        }else{
            if(rect != null){
                x = rect.x;
                y = rect.y;
            }
        }


        return {
            x:x,
            y:y,
            gravity : gravity,
            actionLock : actionLock,
            fixedOrientation : fixedOrientation,
            CanPenetrate:CanPenetrate,
            dir : dir,
            opacity : opacity,
            end: end
        }

    };

    this.load = function(info){

        if(char != null){
            var chars = char.getCharacter();
            if(chars != null){
                chars.x = info.x;
                chars.y = info.y;
                chars.fixedOrientation = info.fixedOrientation;
                chars.CanPenetrate = info.CanPenetrate;
                chars.setLeftRight(info.dir == 1);
                if(chars.getSpirte()){
                    chars.getSpirte().opacity = info.opacity;
                }
            }
            char.IsGravity = info.gravity;
            char.actionLock = info.actionLock;

        }else{
            if(rect != null){
                rect.x = info.x;
                rect.y = info.y;
            }
        }
        doEnd = info.end;
    };

    this.setSwitch = function(index,sw){
        if(RV.GameData.selfSwitch[RV.NowMap.id] == null){
            RV.GameData.selfSwitch[RV.NowMap.id] = [];
        }
        if(RV.GameData.selfSwitch[RV.NowMap.id][_sf.id] == null){
            RV.GameData.selfSwitch[RV.NowMap.id][_sf.id] = [false,false,false,false,false,false,false,false,false];
        }
        RV.GameData.selfSwitch[RV.NowMap.id][_sf.id][index] = sw;
    };





}/**
 * Created by Yitian Chen on 2018-2-26.
 * Weather
 */
function LWeather(){
    //weather type
    var type;
    //current images of weather
    var bitmap;
    //particle of weather
    var particle;
    var rb,sb,pb,lb;
    var null_bitmap;
    var petal;

    bitmap = null;
    type = 0;
    null_bitmap = IBitmap.CBitmap(10, 10);

    /**
     * initialize image of rain
     */
    function rain_init(){
        rb = [RF.LoadBitmap("System/Weather/rain.png")];
    }

    /**
     * initialize image of snow
     */
    function snow_init(){
        sb =[RF.LoadBitmap("System/Weather/snow.png")];
    }

    /**
     * initialize image of petal
     */
    function petal_init(){
        pb = [
            RF.LoadBitmap("System/Weather/petal_0.png"),
            RF.LoadBitmap("System/Weather/petal_1.png"),
            RF.LoadBitmap("System/Weather/petal_2.png")];
    }

    /**
     * initialize image of leaf
     */
    function leaf_init(){
        lb =[RF.LoadBitmap("System/Weather/leaf.png")];
    }

    /**
     * weath settings
     * @param ptype
     */
    this.setWeatherType = function(ptype){
        var max = 10;
        var time =60;
        type = ptype;
        if(type<=0 || type>4){
            type = 0;
            bitmap = null;
            if(petal != null){
                petal.dispose();
            }
            particle.changeParticle([null_bitmap], 0, 1, 0, null);
        }else{
            if(type == 1){
                max = 60;
                time = 60;
                particle.dir = 1;
                particle.line = RV.NowProject.gameHeight;
                bitmap = rb;
            }else if(type == 2){
                bitmap = sb;
                max = 20;
                time = 120;
                particle.line = RV.NowProject.gameHeight;
                particle.dir = 1;
            }else if(type == 3){
                bitmap = null;
                if(petal != null){
                    petal.dispose();
                }
                petal = new LPetal(pb , 20, 1050, null);
            }else if(type == 4){
                bitmap = null;
                if(petal != null){
                    petal.dispose();
                }
                petal = new LPetal(lb , 20, 1050, null);
            }else{
                bitmap = null;
            }
            if(bitmap != null){
                if(petal != null){
                    petal.dispose();
                }
                particle.changeParticle(bitmap, max, time, 0, null);
                particle.z = 1050;
            }else{
                particle.changeParticle([null_bitmap], 0, 1, 0, null);
            }

        }
    };

    /**
     * initialize object of weather
     */
    this.init = function() {
        petal_init();
        leaf_init();
        snow_init();
        rain_init();
        particle  = new IParticle([null_bitmap], 0, 1, 0, null);
        particle.rect = new IRect(0, 0, RV.NowProject.gameWidth, RV.NowProject.gameHeight);
        particle.z = 1050;
    };

    /**
     * main update
     */
    this.update = function() {
        if(type >= 0){
            if(particle != null){
                particle.update();
            }
            if(petal != null){
                petal.update();
            }
        }
    };

    /**
     * dispose
     */
    this.dispose = function() {
        if(particle != null){
            null_bitmap = null;
            rb = null;
            sb = null;
            lb = null;
            particle.dispose();
            particle = null;
        }
        if(petal != null){
            petal.dispose();
        }
    }

}/**
 * Created by Yitian Chen on 2019/06/21.
 */ /**
 * Created by Yitian Chen on 2019/3/17.
 * General control
 */
function RC(){}

//Default button configuration
RC.Key = {
    up        : 87,
    down      : 83,
    left      : 65,
    right     : 68,
    jump      : 74,
    run       : 75,
    atk       : 76,
    ok        : 13,
    cancel    : 27,
    item1     :49,
    item2      :50,
    item3      :51,
    item4      :52,
    skill1     :89,
    skill2     :85,
    skill3     :73,
    skill4     :79,
    skill5      :80
};

/**
 * Game button initialization
 */
RC.KeyInit = function(){
    var keys = RV.NowSet.setAll.key;
    RC.Key.up = keys[0];
    RC.Key.down = keys[1];
    RC.Key.left = keys[2];
    RC.Key.right = keys[3];
    RC.Key.jump = keys[4];
    RC.Key.run = keys[5];
    RC.Key.atk = keys[6];
    RC.Key.ok = keys[7];
    RC.Key.cancel = keys[8];
    RC.Key.item1 = keys[9];
    RC.Key.item2 = keys[10];
    RC.Key.item3 = keys[11];
    RC.Key.item4 = keys[12];
    RC.Key.skill1 = keys[13];
    RC.Key.skill2 = keys[14];
    RC.Key.skill3 = keys[15];
    RC.Key.skill4 = keys[16];
    RC.Key.skill5 = keys[17];

};
/**
 * Input the key code to get the corresponding string
 * @param code
 * @returns string
 */
RC.CodeToSting = function(code) {
    switch (code) {
        case 8:
            return "Back";
        case 9:
            return "Tab";
        case 12:
            return "Clear";
        case 13:
            return "Ent";
        case 16:
            return "Shift";
        case 17:
            return "Ctrl";
        case 18:
            return "Alt";
        case 19:
            return "Pause";
        case 20:
            return "Caps";
        case 27:
            return "Esc";
        case 32:
            return "Space";
        case 33:
            return "Prior";
        case 34:
            return "Next";
        case 35:
            return "End";
        case 36:
            return "Home";
        case 37:
            return "Left";
        case 38:
            return "Up";
        case 39:
            return "Right";
        case 40:
            return "Down";
        case 41:
            return "Select";
        case 42:
            return "Print";
        case 43:
            return "Execute";
        case 45:
            return "Ins";
        case 46:
            return "Del";
        case 47:
            return "Help";
        case 48:
            return "0";
        case 49:
            return "1";
        case 50:
            return "2";
        case 51:
            return "3";
        case 52:
            return "4";
        case 53:
            return "5";
        case 54:
            return "6";
        case 55:
            return "7";
        case 56:
            return "8";
        case 57:
            return "9";
        case 65:
            return "A";
        case 66:
            return "B";
        case 67:
            return "C";
        case 68:
            return "D";
        case 69:
            return "E";
        case 70:
            return "F";
        case 71:
            return "G";
        case 72:
            return "H";
        case 73:
            return "I";
        case 74:
            return "J";
        case 75:
            return "K";
        case 76:
            return "L";
        case 77:
            return "M";
        case 78:
            return "N";
        case 79:
            return "O";
        case 80:
            return "P";
        case 81:
            return "Q";
        case 82:
            return "R";
        case 83:
            return "S";
        case 84:
            return "T";
        case 85:
            return "U";
        case 86:
            return "V";
        case 87:
            return "W";
        case 88:
            return "X";
        case 89:
            return "Y";
        case 90:
            return "Z";
        case 96:
            return "Kp0";
        case 97:
            return "Kp1";
        case 98:
            return "Kp2";
        case 99:
            return "Kp3";
        case 100:
            return "Kp4";
        case 101:
            return "Kp5";
        case 102:
            return "Kp6";
        case 103:
            return "Kp7";
        case 104:
            return "Kp8";
        case 105:
            return "Kp9";
        case 106:
            return "Kp*";
        case 107:
            return "Kp+";
        case 108:
            return "KpEnt";
        case 109:
            return "Kp-";
        case 110:
            return "Kp.";
        case 111:
            return "Kp/";
        case 112:
            return "F1";
        case 113:
            return "F2";
        case 114:
            return "F3";
        case 115:
            return "F4";
        case 116:
            return "F5";
        case 117:
            return "F6";
        case 118:
            return "F7";
        case 119:
            return "F8";
        case 120:
            return "F9";
        case 121:
            return "F10";
        case 122:
            return "F11";
        case 123:
            return "F12";
        case 187:
            return "+";
        case 189:
            return "_";
        case 219:
            return "{";
        case 221:
            return "}";
        case 220:
            return "\\";
        case 186:
            return ";";
        case 222:
            return "\"";
        case 188:
            return "<";
        case 190:
            return ">";
        case 191:
            return "/";
        case 192:
            return "~";
        default:
            return "invalid";
    }
};/**
 * Created by Yitian Chen on 2019/1/3.
 * Common Function
 */
function RF(){}

/**
 * Game over
 */
RF.GameOver = function(){
    if(IVal.scene instanceof SMain){

        IVal.scene.setDialog(new WGameOver(),
            function(fail){
                IVal.scene.setDialog(null,null);
                if(fail == 0){
                    RF.ShowTips("wait")
                }
                if(fail == 1){
                    IVal.scene.dispose();
                    IVal.scene = new STitle();
                }
                if(fail == 2){
                    RF.LoadGame();
                }
            });
    }
};
/**
 * Game win
 */
RF.GameWin = function(){
    if(IVal.scene instanceof  SMain){
        IVal.scene.setDialog(new WGameWin(),
            function(Win){
                IVal.scene.setDialog(null,null);
                if(Win == 0){
                    IVal.scene.dispose();
                    IVal.scene = new STitle();
                }
                if(Win == 1){
                    IVal.scene.dispose();
                    RV.GameData.init();
                    IVal.scene = new SMain();
                }
        })
    }
};
/**
 * Game Menu
 */
RF.GameMenu = function(){
    if(IVal.scene instanceof SMain){
        IVal.scene.setDialog(new WMenu(),
            function(menu){
            if(menu == "loadGame"){
                RF.LoadGame();
            }else if(menu == "backTitle"){
                IVal.scene.dispose();
                IAudio.BGMFade(2);
                IAudio.BGSFade(2);
                IVal.scene = new STitle();
            }
        });
    }
};
/**
 * Load bitmap
 * @param path path of image
 */
RF.LoadBitmap = function(path){
    if(RV.Platform == "PC"){
        return IBitmap.WBitmap("Graphics/" + path);
    }

};

/**
 * Load cache
 * @param path | path of image
 * @param func | callback after loading
 * @param tag | Tag during reading
 * @returns {*} | image in cache
 */
RF.LoadCache = function(path,func,tag){
    if(RV.Cache[path] == null){
        RV.Cache[path] = RF.LoadBitmap(path);
        RV.Cache[path].loadTexture();
        if(RV.Cache[path].complete){
            if(func != null) func(RV.Cache[path],tag)
        }else {
            RV.Cache[path].onload = function(){
                if(func != null) func(RV.Cache[path],tag);
            };
            RV.Cache[path].onerror = function(){
                if(func != null) func(null,tag);
            };
        }
        return RV.Cache[path];
    }else{
        if(func != null){
            if(func != null) func(RV.Cache[path],tag);
        }
        return RV.Cache[path];
    }
};


/**
 * Preload UI resource
 * @param fileAry | File array
 * @param loadOver callback after loading function(ary)
 */
RF.CacheUIRes = function(fileAry,loadOver){
    var index = 0;
    var hash = [];
    for(var i = 0;i<fileAry.length;i++){
        var bitmap = RF.LoadBitmap(fileAry[i]);
        hash[fileAry[i]] = bitmap;
        if(bitmap.complete){
            index += 1;
            if(index >= fileAry.length){
                loadOver(hash)
            }
        }else{
            bitmap.onload = function(){
                index += 1;
                if(index >= fileAry.length){
                    loadOver(hash)
                }
            };
            bitmap.onerror = function(){
                index += 1;
                if(index >= fileAry.length){
                    loadOver(hash)
                }
            };
        }
    }
};


/**
 *Get time
 * @param s
 * @returns {string}
 * @constructor
 */
RF.MakerTime = function(s){
    if(s >= 3600){
        return parseInt(s / 3600) + ":" + (parseInt(s / 60) % 60) + ":" + (s % 60);
    }else if(s >= 60){
        return parseInt(s / 60) + ":" + (s % 60);
    }else if(s >= 0){
        return "00"+":"+ s ;
    }
    else{
        s = 0;
        return "00"+":"+s;
    }
};
/**
 * Get timestamp
 * @constructor
 */
RF.GetTime = function(){
    var time = Number(new Date());
    return parseInt(time / 1000);
};

/**
 * Draw continuous window(dialog)
 * @param fbmp | Sprite
 * @param bmp  | bitmap
 * @param w    window width
 * @param h    window height
 * @param x    offset x of window
 * @param y    offset y of window
 * @param l    Unit grid size（square must）;
 */
RF.DrawFrame = function( fbmp, bmp,  w, h, x, y , l){
    var width = w;
    var height = h;

    var g = fbmp;

    var lt = l;

    //edge
    g.drawBitmap(bmp[0], x, y);
    g.drawBitmap(bmp[2], x + width - lt, y);
    g.drawBitmap(bmp[5], x, y + height - lt);
    g.drawBitmap(bmp[7], x + width - lt, y + height - lt);
    //get width and height
    width = width - lt - lt;
    height = height- lt - lt;

    g.drawBitmapRect(bmp[1], new IRect(x + lt,y, x + lt + width , y + lt),false);//top
    g.drawBitmapRect(bmp[3], new IRect(x,y + lt,x + lt,y + lt + height),false);//left
    g.drawBitmapRect(bmp[6], new IRect(x + lt, y + height + lt, x + lt + width,y + height + lt + lt),false);//bottom
    g.drawBitmapRect(bmp[4], new IRect(x + width + lt , y + lt,x + width + lt + lt,y + lt + height),false);//right
    g.drawBitmapRect(bmp[8], new IRect(x + lt,y + lt,x + lt +width,y + lt+height),false);//center

};

/**
 * Press continue or not
 * @returns {boolean}
 */
RF.IsNext = function(){
    return IInput.up || IInput.isKeyDown(RC.Key.atk) || IInput.isKeyDown(13) || IInput.isKeyDown(27) || IInput.isKeyDown(32);
};
/**
 * default color 0
 * @returns {IColor}
 */
RF.C0 = function(){
    return IColor.White();
};

/**
 * Show tips
 * @param m tips contents
 */
RF.ShowTips = function(m){
    if(RV.Toast != null){
        RV.Toast.dispose();
        RV.Toast = null;
    }
    var msg = RF.MakerValueText(m);
    var msgs = RF.TextAnalysisNull(msg).split(RF.CharToAScII(60000));
    var width = 0;
    var line = 0;
    for(var i = 0;i<msgs.length;i++){
        var tempw = IFont.getWidth(msgs[i], 16);
        if(tempw > width){
            width = tempw;
        }
        line += Math.ceil(tempw / 240.0);
    }
    var height = 20;
    if(line > 1){
        height += (line - 1) * IFont.getHeight("A", 16) * 1.5;
        width = parseInt(Math.min(240,width));
    }
    if(width < 16){
        width = 16;
    }
    var l = (IVal.GWidth - width)/2;
    var t = (IVal.GHeight - height)/2;
    var r = l + width + 20;
    var b = t + height + 20;

    RV.Toast = new ISprite(width + 20, height + 20,IColor.Transparent());
    RV.Toast.x = (IVal.GWidth - width ) / 2;
    RV.Toast.y = (IVal.GHeight - height )  / 2;
    RV.Toast.z = 999999990;
    RV.Toast.opacity = 1.0;
    RV.Toast.endAction();
    RV.Toast.clearBitmap();
    RF.DrawFrame(RV.Toast , RV.ToastPics,  width + 20, height + 20, 0, 0 , 8);
    RV.Toast.drawText("\\s[16]\\c[255,255,255]" + msg,10,10 ,0,undefined,true, width + 10);
    RV.Toast.addAction(action.wait,90);
    RV.Toast.addAction(action.fade,0,30);
};

/**
 * Key string translated to "empty"
 * @param str
 * @returns {String}
 */
RF.TextAnalysisNull = function(str){
    var s = new String(str);
    s = ISprite.toRegular(s);
    s = s.replaceAll("\\r\\n", "\\n");
    s = s.replaceAll("\\\\[Nn]", RF.CharToAScII(60000));
    s = s.replaceAll("\\\\[Cc]\\[([0-9]+,[0-9]+,[0-9]+)]", "");
    s = s.replaceAll("\\\\[Ss]\\[([0-9]+)]", "");
    s = s.replaceAll("\\\\[Pp]", "");
    s = s.replaceAll("\\\\[Ww]\\[([0-9]+)]", "");
    s = s.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]","  ");
    s = s.replaceAll("\\\\cd", "");
    s = s.replaceAll("\\\\ck", "");
    s = s.replaceAll("\\\\=", "");
    s = s.replaceAll("\\\\>", "");
    s = s.replaceAll("\\\\~", "");
    s = s.replaceAll("\\\\\\|", "");
    return s;
};
/**
 * String converts to key encoding
 * @param str
 * @returns {String}
 * @constructor
 */
RF.TextAnalysis = function(str){
    var s = new String(str);
    s = ISprite.toRegular(s);
    s = s.replaceAll("\\r\\n", "\\n");
    s = s.replaceAll("\\\\[Nn]", RF.CharToAScII(60000));
    s = s.replaceAll("\\\\[Cc]\\[([0-9]+,[0-9]+,[0-9]+)]",RF. CharToAScII(60001) + "[$1]");
    s = s.replaceAll("\\\\[Ss]\\[([0-9]+)]", RF.CharToAScII(60002) + "[$1]");
    s = s.replaceAll("\\\\[Pp]", RF.CharToAScII(60100));
    s = s.replaceAll("\\\\[Ww]\\[([0-9]+)]", RF.CharToAScII(60104) + "[$1]");
    s = s.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]",RF.CharToAScII(60003) +"[$1]");
    s = s.replaceAll("\\\\>", RF.CharToAScII(60105));
    s = s.replaceAll("\\\\=", RF.CharToAScII(60106));
    s = s.replaceAll("\\\\~", RF.CharToAScII(60101));
    s = s.replaceAll("\\\\\\|", RF.CharToAScII(60103));
    return s;
};

/**
 * iFAction coordinates Translation
 * @param win | window
 * @param self | The object to calculate // if value is a number, it can be default
 * @param value | string or Fixed value
 * @param xy | x or y //  if value is a number, it can be default
 * @returns Number
 */
RF.PointTranslation = function(win,self,value,xy){
    if(typeof(value)=='string'){
        var tag = value.split("_");
        var obj = tag[0];
        var alignment = tag[1];
        var deviation =  parseInt(tag[2]);
        var val = 0;
        var val2 = 0;
        var vars = 0;
        if(obj == "scene"){
            if(xy == "x"){
                val = IVal.GWidth;
                vars = self.width;
            }else{
                val = IVal.GHeight;
                vars = self.height;
            }
        }else{
            try{
                if(xy == "x"){
                    val = win.getEval(obj + ".width");
                    val2 = win.getEval(obj + ".x");
                    vars = self.width;
                }else{
                    val = win.getEval(obj + ".height");
                    val2 = win.getEval(obj + ".y");
                    vars = self.height;
                }
            }catch(e){ return 0}

        }
        if(alignment == "left" || alignment == "top"){
            return val2 + deviation;
        }else if(alignment == "center"){
            return (val2 + (val - vars) / 2) + deviation;
        }else if(alignment == "right" || alignment == "bottom"){
            return (val2 + val - vars) + deviation;
        }

    }else{
        return value;
    }
};

/**
 * calculate the damage number made by the attack of actor( to enemies)
 * @param enemy | enemy
 * @param dir   | direction
 * @returns Object
 */
RF.ActorAtkEnemy = function(enemy,dir){
    if(enemy.visible === false) return null;
    //get basic value
    var temp1 = RV.GameData.actor.getWAtk() - enemy.getWDef();
    var attributeNum = RV.GameData.actor.getAttribute(enemy.getData().attributeId);
    //calculate the damage number
    var temp2 = Math.max(1,temp1) * attributeNum.atk - Math.max(1,temp1) * attributeNum.def;
    //Discrete
    var d1 = temp2 * 0.85;
    var d2 = temp2 * 1.15;
    var d = rand(Math.floor(d1),Math.ceil(d2));
    //crit
    var crit = false;
    //dodge rate
    var luckNum1 = (enemy.getAddDodge() / 100) + Math.max( 0 , enemy.getSpeed() - RV.GameData.actor.getSpeed()) / (RV.GameData.actor.getSpeed() + enemy.getSpeed()) / 2;
    //crit rate
    var luckNum2 = ( RV.GameData.actor.getAddCrit() / 100) + Math.max( 0 , RV.GameData.actor.getLuck() - enemy.getLuck()) / (RV.GameData.actor.getLuck() + enemy.getLuck()) / 2;
    //calculate dodge
    if(RF.ProbabilityHit(luckNum1) || d == 0){
        new LNum(3 , 0 , RV.NowMap.getView() , enemy.getActor().getCharacter().x , enemy.getActor().getCharacter().y);
        return null;
    }
    //calculate crit
    if(RF.ProbabilityHit(luckNum2)){
        crit = true;
        d = d * (1.5 +  ( RV.GameData.actor.getAddCritF() / 100));
    }
    //calculate Knockback
    var r = RV.GameData.actor.getRepel();
    //buff
    var buffs = RV.GameData.actor.getAtkBuffs();
    for(var mid in buffs){
        if(buffs[mid] === 1){
            enemy.addBuff(mid);
        }else if(buffs[mid] === 2){
            enemy.subBuff(mid);
        }
    }
    //return result
    return {
        crit : crit,
        damage : d,
        repel : r,
        dir : dir,
        fly : 0
    };
};
/**
 * calculate the damage number made by enemy( to actor )
 * @param enemy
 * @returns {{damage: *, repel: (number|DSetArms.repel), fly: number, crit: boolean, dir: number}|null}
 */
RF.EnemyAtkActor = function(enemy){
    //get basic value
    var temp1 =  enemy.getWAtk() - RV.GameData.actor.getWDef();
    var attributeNum =  enemy.getAttribute();
    //calculate the damage number
    var temp2 = Math.max(1,temp1) * attributeNum.atk - Math.max(1,temp1) * attributeNum.def;
    //Discrete
    var d1 = temp2 * 0.85;
    var d2 = temp2 * 1.15;
    var d = rand(Math.floor(d1),Math.ceil(d2 + 1));
    //crit
    var crit = false;
    //dodge rate
    var luckNum1 = (RV.GameData.actor.getAddDodge() / 100) +  Math.max( 0 , RV.GameData.actor.getSpeed() - enemy.getSpeed()) / (RV.GameData.actor.getSpeed() + enemy.getSpeed()) / 2;
    //crit rate
    var luckNum2 = ( enemy.getAddCrit() / 100) + Math.max( 0 , enemy.getLuck() - RV.GameData.actor.getLuck()) / (RV.GameData.actor.getLuck() + enemy.getLuck()) / 2;
    //calculate dodge
    if(RF.ProbabilityHit(luckNum1) || d == 0){
        new LNum(3 , 0 , RV.NowMap.getView() , RV.NowMap.getActor().getCharacter().x ,  RV.NowMap.getActor().getCharacter().y);
        return null;
    }
    //calculate crit
    if(RF.ProbabilityHit(luckNum2)){
        crit = true;
        d = d * (1.5 + (enemy.getAddCritF() / 100));
    }
    RV.NowCanvas.playAnim(enemy.atkAnim,null,RV.NowMap.getActor(),true,null);
    //calculate Knockback
    var r = enemy.getRepel();
    //return result
    return {
        crit : crit,
        damage : d,
        repel : r,
        dir : enemy.getDir(),
        fly : 0
    };
};


/**
 * calculate the damage number made by enemy( to enemies )
 * @param enemy
 * @param enemy2
 * @returns {{damage: *, repel: (number|DSetArms.repel), fly: number, crit: boolean, dir: number}|null}
 */
RF.EnemyAtkEnemy = function(enemy,enemy2){
    //get basic value
    var temp1 =  enemy.getWAtk() - enemy2.getWDef();
    var attributeNum =  enemy.getAttribute(enemy2);
    //calculate the damage number
    var temp2 = Math.max(1,temp1) * attributeNum.atk - Math.max(1,temp1) * attributeNum.def;
    //Discrete
    var d1 = temp2 * 0.85;
    var d2 = temp2 * 1.15;
    var d = rand(Math.floor(d1),Math.ceil(d2 + 1));
    //crit
    var crit = false;
    //dodge rate
    var luckNum1 = (enemy2.getAddDodge() / 100) + Math.max( 0 , enemy2.getSpeed() - enemy.getSpeed()) / (enemy2.getSpeed() + enemy.getSpeed()) / 2;
    //crit rate
    var luckNum2 = ( enemy.getAddCrit() / 100) + Math.max( 0 , enemy.getLuck() - enemy2.getLuck()) / (enemy2.getLuck() + enemy.getLuck()) / 2;
    //calculate dodge
    if(RF.ProbabilityHit(luckNum1) || d == 0){
        new LNum(3 , 0 , RV.NowMap.getView() , enemy2.getActor().getCharacter().x ,  enemy2.getActor().getCharacter().y);
        return null;
    }
    //calculate crit
    if(RF.ProbabilityHit(luckNum2)){
        crit = true;
        d = d * (1.5 + (enemy.getAddCritF() / 100));
    }
    RV.NowCanvas.playAnim(enemy.atkAnim,null,enemy2.getActor(),true,null);
    //calculate Knockback
    var r = enemy.getRepel();
    //return result
    return {
        crit : crit,
        damage : d,
        repel : r,
        dir : enemy.getDir(),
        fly : 0
    };
};

/**
 * Random selection of array values
 * @param ary
 * @returns {null|*}
 * @constructor
 */
RF.RandomChoose = function(ary){
    if(ary == null || ary.length <= 0){
        return null;
    }
    return ary[Math.floor(Math.random() * ary.length)];
};
/**
 * Whether the specified rate is achieved
 * @param rate | rate(floating point)
 * @returns {boolean}
 */
RF.ProbabilityHit = function(rate){
    return rate >  Math.random();
};
/**
 * String converts to AscII
 * @param num
 * @returns {string}
 */
RF.CharToAScII = function(num) {
    return String.fromCharCode(num);
};
/**
 * Save game
 */
RF.SaveGame = function(){
    RV.GameData.save();
    RF.ShowTips("Save Completed");
};
/**
 * Load game
 */
RF.LoadGame = function(){
    RV.IsDie = false;
    IAudio.BGMFade(2);
    IVal.scene.dispose();
    if(GMain.haveFile()){
        RV.GameData.load();
    }else{
        RV.GameData.init();
    }
    RV.InterpreterMain = new IMain();
    RV.InterpreterOther = [];
    IVal.scene = new SMain();
};

RF.AddOtherEvent = function(events,tag,id){
    var doEvent = new IMain();
    doEvent.addEvents(events);
    doEvent.tag = tag;
    doEvent.NowEventId = id;
    RV.InterpreterOther.push(doEvent);
};

RF.FindOtherEvent = function(tag){
    for(var i = 0;i<RV.InterpreterOther.length;i++){
        if(RV.InterpreterOther[i].tag == tag){
            return RV.InterpreterOther[i];
        }
    }
    return null;
};

RF.CheckLanguage = function(str){
    var reg = new RegExp("[\\u4E00-\\u9FFF]+","g");
    if(reg.test(str)){
        return true;
    }
    reg = new RegExp("[\\u3040-\\u309F\\u30A0-\\u30FF]+","g");
    if(reg.test(str)){
        return true;
    }
    reg = new RegExp("[\\u0E00-\\u0E7F]+","g");
    if(reg.test(str)){
        return true;
    }
    return false;
};


RF.MakerValueText = function(str){
    if(str != null){
        var s = str.replaceAll("\\\\[Vv]\\[([a-zA-Z0-9-_]+)]",RF.CharToAScII(60003)+  "[$1]");
        var end = "";
        while(true){
            if(s.length <= 0){
                break;
            }
            var min = s.substring(0,1);
            s = s.substring(1,s.length);
            var c = min.charCodeAt(0);
            if(c == 60003){
                var returnS = RF.TextToTemp(s , "[","]","\\[([a-zA-Z0-9-_]+)]");
                s = RV.GameData.getValues(parseInt(returnS[0])) + returnS[1];
            }else{
                end += min;
            }
        }
        return end;
    }
    return "";
};

RF.TextToTemp = function( mainText, s, e, rex){
    var tmp = mainText.substring(mainText.indexOf(s) + 1,mainText.indexOf(e));
    mainText = mainText.substring(tmp.length + s.length + e.length, mainText.length);
    var temp1 = tmp.replaceAll(rex, "$1");
    var temp_2 = temp1.replaceAll(" ", "");
    var temp_e = temp_2.replaceAll("，", ",");
    return [temp_e,mainText];
};/**
 * Created by Yitian Chen on 2019/1/3.
 * Global Variable
 */
function RV(){}

//platform of game
RV.Platform = "PC";//PC Andoir iOS Web WP WeiXin
//current project data of the game
RV.NowProject = null;
//Current resource data of the game
RV.NowRes = null;
//Current game settings data
RV.NowSet = null;

//current map
RV.NowMap = null;
//current canvas
RV.NowCanvas = null;
//ID of the currently executing trigger 
RV.NowEventId = -1;

//Tips box
RV.Toast = null;
//cache images of tips box
RV.ToastPics = [];
//cache images of damage number 
RV.NumberPics = [];

//game data
RV.GameData = null;
//settings data
RV.GameSet = null;
//Main Interpreter
RV.InterpreterMain = null;
//Asynchronous interpreter
RV.InterpreterOther = [];
//Is the character dead
RV.IsDie = false;

/**
 * Font color
 */
RV.setColor = {
    //window
    wBase : IColor.White(),
    //Main
    cBase : IColor.White(),
    //title of details(Main)
    detail : IColor.CreatColor(238,201,0),
    //equipped and not(Equipment)
    unused : IColor.CreatColor(90,90,90),
    //compare (Equipment bag)
    show : IColor.Black(),
    //equipped and not(Skills)
    tag : IColor.Green(),
    //number of items
    num : IColor.Black(),
    //button of msgBox
    button : IColor.CreatColor(28,28,28),
    //shortcut
    shortcut : IColor.Black(),
    //outline
    outline : IColor.Black()
};

//load event
RV.isLoad = false;
//cache
RV.Cache = [];

/**
 * Created by Yitian Chen on 2019/2/20.
 * Main interface control·Action
 */
function CActorAction(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //jump button
    var jumpButtonX = "scene_right_-24";
    var jumpButtonY = "scene_bottom_-6";
    //attack button
    var atkButtonX = "scene_right_-80";
    var atkButtonY = "scene_bottom_-40";
    //number of slots
    var buttonNum = 5;
    //the first slot(from letf to right)
    var skillButtonX = "";
    var skillButtonY = "";
    if(IsPC()){//PC
        skillButtonX = "scene_right_-330";
        skillButtonY = "scene_bottom_-6";
    }
    else{
        //Start angle of slots
        var angel = 150;
        //Angle between slots
        var angelGap = 45;
    }
    //details box，Relative coordinates of slots
    var tipsX = 0;
    var tipsY = 40;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes  ===================================
    this.isJumpClick = false;
    this.isAtkClick = false;
    //====================================  Private attributes ===================================
    //data of slots
    var userSkill = RV.GameData.userSkill;
    //jump button
    var jumpButton = null;
    //attack button
    var atkButton = null;
    //slots array
    var skillButton = [];
    //index of selected slot
    var showTipsIndex = -1;
    //details box
    var tips = null;
    //temporary value
    var tempSkill = [-1,-1,-1,-1,-1];
    
    var loadOver = false;
    var resList = [RF.LoadCache("System/Tips/back-text_0.png"),
        RF.LoadCache("System/Tips/back-text_1.png"),
        RF.LoadCache("System/Tips/back-text_2.png"),
        RF.LoadCache("System/Tips/back-text_3.png"),
        RF.LoadCache("System/Tips/back-text_4.png"),
        RF.LoadCache("System/Tips/back-text_5.png"),
        RF.LoadCache("System/Tips/back-text_6.png"),
        RF.LoadCache("System/Tips/back-text_7.png"),
        RF.LoadCache("System/Tips/back-text_8.png")];
    //==================================== Private Function ===================================
    /**
     * details box
     * @param tag | slot index
     * @param skill | data of skill
     */
    function drawTips(tag,skill){
        var message = RF.TextAnalysisNull(skill.msg);
        var msg = message.split(RF.CharToAScII(60000));
        var drawMsg = skill.msg.split("\\n");
        var width = 0;
        var line = 0;
        for(var i = 0;i<msg.length;i++){
            var txtW = IFont.getWidth(msg[i], 15);
            if(txtW > width){
                width = txtW;
            }
            line += Math.ceil(txtW / 240);
        }
        var height = 50;
        if(line > 1){
            height += Math.ceil(line - 1) * 18;
            width = parseInt(Math.min(240,width)) + 10;
        }
        if(width < 122){
            width = 122;
        }
        var detailsBox = new ISprite(IBitmap.CBitmap(parseInt(width + 36), parseInt(height + 80)));
        detailsBox.z = 999999 + 10;
        var w = parseInt(width + 26);
        detailsBox.tag = tag;
        RF.DrawFrame(detailsBox, resList, w, parseInt(height + 50) + IFont.getHeight(skill.cd,14) + 5, 0, 0,24);
        detailsBox.drawText("\\s[16]" + skill.name,10,5,0,RV.setColor.cBase,true,width - 10);
        detailsBox.drawText("\\c[238,201,0]\\s[14]Cost MP：" + skill.useMp,10,20 + IFont.getHeight(skill.name,16),0,RV.setColor.detail,true,width - 10);
        detailsBox.drawText("\\c[238,201,0]\\s[14]CD：" + skill.cd + "s",10,40 + IFont.getHeight(skill.useMp,14),0,RV.setColor.detail,true,width - 10);
        for(i = 0;i<drawMsg.length;i++){
            detailsBox.drawText("\\s[15]" + drawMsg[i],10,60 + IFont.getHeight(skill.cd,14) + 18 * i,0,RV.setColor.cBase,true,width);
        }
        return detailsBox;
    }
    RF.CacheUIRes(
        [
            "System/button-atk_0.png",
            "System/button-atk_1.png",
            "System/button-jump_0.png",
            "System/button-jump_1.png",
            "System/button-skill_0.png",
            "System/button-skill_1.png",
            "System/button-skill_2.png",
            "System/board-short-key.png"
        ]
        , init);
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        if(!IsPC()){
            jumpButton = new IButton(hash["System/button-jump_0.png"],hash["System/button-jump_1.png"]);
            jumpButton.x = RF.PointTranslation(_sf , jumpButton , jumpButtonX , "x");
            jumpButton.y = RF.PointTranslation(_sf , jumpButton , jumpButtonY , "y");
            jumpButton.z = 1005;
            jumpButton.visible = RV.GameData.uiPhone;
            atkButton = new IButton(hash["System/button-atk_0.png"],hash["System/button-atk_1.png"]);
            atkButton.x = RF.PointTranslation(_sf , atkButton , atkButtonX , "x");
            atkButton.y = RF.PointTranslation(_sf , atkButton , atkButtonY , "y");
            atkButton.z = 1005;
            atkButton.visible = RV.GameData.uiPhone;
        }
        for(var i = 0;i< buttonNum;i++){

            var keyStr = [
                RC.CodeToSting(RC.Key.skill1),
                RC.CodeToSting(RC.Key.skill2),
                RC.CodeToSting(RC.Key.skill3),
                RC.CodeToSting(RC.Key.skill4),
                RC.CodeToSting(RC.Key.skill5)
            ];
            var tempButton = new CActorSKillCooling( RV.NowSet.findSkillId(userSkill[i]) ,hash["System/button-skill_0.png"],
                hash["System/button-skill_1.png"],hash["System/button-skill_2.png"]
                ,hash["System/board-short-key.png"],keyStr[i]);
            if(jumpButton != null){
                var angelNum = Math.PI * angel  / 180.0;
                tempButton.x = (atkButton.x + (atkButton.width / 2)) + parseInt(Math.cos(angelNum) * (atkButton.width)) - tempButton.width / 2;
                tempButton.y = (atkButton.y + (atkButton.height / 2)) + parseInt(Math.sin(angelNum) * (atkButton.width)) - tempButton.height / 2;
                angel += angelGap;
            }
            else{
                tempButton.x = RF.PointTranslation(_sf , tempButton , skillButtonX , "x") + tempButton.width * i;
                tempButton.y = RF.PointTranslation(_sf , tempButton , skillButtonY , "y");
            }
            tempButton.z = 1005;
            skillButton[i] = tempButton;
        }
        loadOver = true;
    }
    /**
     * update key
     */
    function updatePCKey(){
        if(!loadOver) return true;
        if(skillButton[0].enable && IInput.isKeyDown(RC.Key.skill1) && RV.GameData.actor.LSkill != true){
            skillButton[0].doThis();
        }
        if(skillButton[1].enable && IInput.isKeyDown(RC.Key.skill2) && RV.GameData.actor.LSkill != true){
            skillButton[1].doThis();
        }
        if(skillButton[2].enable && IInput.isKeyDown(RC.Key.skill3) && RV.GameData.actor.LSkill != true){
            skillButton[2].doThis();
        }
        if(skillButton[3].enable && IInput.isKeyDown(RC.Key.skill4) && RV.GameData.actor.LSkill != true){
            skillButton[3].doThis();
        }
        if(skillButton[4].enable && IInput.isKeyDown(RC.Key.skill5) && RV.GameData.actor.LSkill != true){
            skillButton[4].doThis();
        }
    }
    /**
     * draw slots
     */
    function updateDraw(){
        for(var i = 0; i< tempSkill.length; i++){
            if(RV.GameData.userSkill[i] != tempSkill[i]){
                tempSkill[i] = RV.GameData.userSkill[i];
                skillButton[i].setData(RV.NowSet.findSkillId(RV.GameData.userSkill[i]));
            }
        }
    }
    //====================================  Public Function  ===================================
    /**
     * set visibility of slots
     * @param vis | true visible ; false Invisible
     */
    this.setSkillVisible = function(vis){
        for(var i = 0;i<skillButton.length;i++){
            skillButton[i].setVisible(vis);
        }
    };
    /**
     * set visibility of slots in phone
     * @param vis | true visible ; false Invisible
     */
    this.setPhoneVisible = function(vis){
        if(jumpButton != null){
            jumpButton.visible = vis;
            atkButton.visible = vis;
        }
    };
    /**
     * Update this interface
     */
    this.update = function(){
        showTipsIndex = -1;
        if(updatePCKey()) return true;
        if(jumpButton != null) _sf.isJumpClick = jumpButton.update();
        if(atkButton != null) _sf.isAtkClick = atkButton.update();
        updateDraw();
        for (var i = 0; i < skillButton.length; i++) {
            skillButton[i].update();
            if (skillButton[i].canShowTips()) {
                IInput.Tlong = false;
                showTipsIndex = i;
                if(tips == null || tips.tag != i){
                    if(tips != null){
                        tips.dispose();
                        tips = null;
                    }
                    if(RV.GameData.userSkill[i] > 0){
                        var cof = skillButton[i].getData();
                        tips = drawTips(i,cof);
                        tips.x = skillButton[i].x - tips.width + skillButton[i].width + tipsX ;
                        tips.y = skillButton[i].y - tips.height - skillButton[i].height / 2 + tipsY;
                        tips.z = 1100;
                    }
                }
            }
        }
        if(tips!= null && showTipsIndex != tips.tag){
            tips.dispose();
            tips = null;
        }
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(){
        if(jumpButton != null) jumpButton.dispose();
        if(atkButton != null) atkButton.dispose();
        for(var i = 0;i<skillButton.length;i++){
            skillButton[i].dispose();
        }
    };
} /**
 * Created by YewMoon on 2019/2/20.
  * Main interface control·Inventory Slot
 */
function CActorItem(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //spacing of slots
    var buttonGap = 15;
    //number of slots
    var buttonNum = 4;
    //the first slot(from letf to right)
    var buttonX = "";
    var buttonY = "";
    if(IsPC()){//PC
        buttonX = "scene_left_20";
        buttonY = "scene_bottom_-6";
    }
    else{
        buttonX = "scene_center_-150";
        buttonY = "scene_bottom_-26";
    }
    //details box，Relative coordinates of slots
    var tipsX = 0;
    var tipsY = 56;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Private attributes ===================================
    //slots array
    var itemButton = [];
    //number back
    var itemShortCut = [];
    //index of selected slot
    var showTipsIndex = -1;
    //details box
    var tips = null;
     //temporary value
     var tempItem = [-1,-1,-1,-1];
     var tempItemNum = [-1,-1,-1,-1];
    
    var loadOver = false;
    var resList = [RF.LoadCache("System/Tips/back-text_0.png"),
        RF.LoadCache("System/Tips/back-text_1.png"),
        RF.LoadCache("System/Tips/back-text_2.png"),
        RF.LoadCache("System/Tips/back-text_3.png"),
        RF.LoadCache("System/Tips/back-text_4.png"),
        RF.LoadCache("System/Tips/back-text_5.png"),
        RF.LoadCache("System/Tips/back-text_6.png"),
        RF.LoadCache("System/Tips/back-text_7.png"),
        RF.LoadCache("System/Tips/back-text_8.png")];
    //==================================== Private Function ===================================
    /**
     * details box
     * @param tag | slot index
     * @param item | data of item
     */
    function drawTips(tag,item){
        var message = RF.TextAnalysisNull(item.msg);
        var msg = message.split(RF.CharToAScII(60000));
        var drawMsg = item.msg.split("\\n");
        var width = 0;
        var line = 0;
        for(var i = 0;i<msg.length;i++){
            var txtW = IFont.getWidth(msg[i], 15);
            if(txtW > width){
                width = txtW;
            }
            line += Math.ceil(txtW / 240.0);
        }
        var height = 50;
        if(line > 1){
            height += Math.ceil(line - 1) * 18.0;
            width = parseInt(Math.min(240,width)) + 10 ;
        }
        if(width < 122){
            width = 122;
        }
        var detailsBox = new ISprite(IBitmap.CBitmap(parseInt(width + 36), parseInt(height + 80)));
        detailsBox.z = 999999 + 10;
        var w = parseInt(width + 26);
        detailsBox.tag = tag;
        RF.DrawFrame(detailsBox, resList, w, parseInt(height + 30) + IFont.getHeight(item.name,16) + 5, 0, 0,24);
        detailsBox.drawText("\\s[16]" + item.name,10,5,0,RV.setColor.cBase,true,width - 10);
        for(i = 0;i<drawMsg.length;i++){
            detailsBox.drawText("\\s[15]" + drawMsg[i],10,20 + IFont.getHeight(item.name,16) + 18 * i,0,RV.setColor.cBase,true,width);
        }
        return detailsBox;
    }
    RF.CacheUIRes(
        [
            "System/button-item_0.png",
            "System/button-item_1.png",
            "System/button-item_2.png",
            "System/board-item-num.png",
            "System/board-short-key.png"
        ]
        , init);
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        for(var i = 0; i< buttonNum;i++){
            var keyStr = [
                RC.CodeToSting(RC.Key.item1),
                RC.CodeToSting(RC.Key.item2),
                RC.CodeToSting(RC.Key.item3),
                RC.CodeToSting(RC.Key.item4)
            ];
            var tempButton = new CActorItemCooling(RV.GameData.userItem[i] ,hash["System/button-item_0.png"],
                hash["System/button-item_1.png"],hash["System/button-item_2.png"]
                ,hash["System/board-short-key.png"],keyStr[i],hash["System/board-item-num.png"]);
            tempButton.x = RF.PointTranslation(_sf , tempButton , buttonX , "x") + tempButton.width * i + buttonGap;
            tempButton.y = RF.PointTranslation(_sf , tempButton , buttonY , "y");
            tempButton.z = 1005;
            itemButton[i] = tempButton;
        }
        loadOver = true;
    }
    /**
     * update key
     */
    function updatePCKey(){
        if(itemButton[0].enable && IInput.isKeyDown(RC.Key.item1)){
            itemButton[0].doThis();
        }
        if(itemButton[1].enable && IInput.isKeyDown(RC.Key.item2)){
            itemButton[1].doThis();
        }
        if(itemButton[2].enable && IInput.isKeyDown(RC.Key.item3)){
            itemButton[2].doThis();
        }
        if(itemButton[3].enable && IInput.isKeyDown(RC.Key.item4)){
            itemButton[3].doThis();
        }
    }
     /**
      * draw slots
      */
     function updateDraw(){
         for(var i = 0; i< tempItem.length; i++){
             if(RV.GameData.userItem[i].id != tempItem[i]){
                 tempItem[i] = RV.GameData.userItem[i].id;
                 itemButton[i].setData(RV.GameData.userItem[i]);
             }
         }
     }

    //==================================== Public Function ===================================
     /**
      * set visibility of slots
      * @param vis | true visible ; false Invisible
      */
     this.setVisible = function(vis){
         for (var i = 0; i < itemButton.length; i++) {
             itemButton[i].setVisible(vis);
         }
     };
     /**
      * update number of items
      */
     this.updateNum = function(){
         for(var i = 0; i< tempItem.length; i++){
             if(RV.GameData.userItem[i] != 0 && RV.GameData.userItem[i] != null && RV.GameData.userItem[i].num != tempItemNum[i]){
                 tempItemNum[i] = RV.GameData.userItem[i].num;
                 itemButton[i].setNum(RV.GameData.userItem[i]);
             }
         }
     };
    /**
     * Update this interface
     */
    this.update = function() {
        if(!loadOver) return true;
        showTipsIndex = -1;
        if(updatePCKey()) return true;
        updateDraw();
        _sf.updateNum();
        for (var i = 0; i < itemButton.length; i++) {
            itemButton[i].update();
            if (itemButton[i].canShowTips()) {
                IInput.Tlong = false;
                showTipsIndex = i;
                if(tips == null || tips.tag != i){
                    if(tips != null){
                        tips.dispose();
                        tips = null;
                    }
                    if(RV.GameData.userItem[i] != 0 && RV.GameData.userItem[i] != null && RV.GameData.userItem[i].id >= 0 && RV.GameData.userItem[i].num > 0){
                        var cof = itemButton[i].getData();
                        tips = drawTips(i,cof);
                        tips.x = itemButton[i].x + tipsX;
                        tips.y = itemButton[i].y - tips.height - itemButton[i].height / 2 + tipsY;
                        tips.z = 1100;
                    }
                }
            }
        }
        if(tips!= null && showTipsIndex != tips.tag){
            tips.dispose();
            tips = null;
        }

    };
    /**
     * Dispose this interface
     */
    this.dispose = function(){
        for(var i = 0;i<itemButton.length;i++){
            itemButton[i].dispose();
            if(itemShortCut[i] != null) itemShortCut[i].dispose();
        }
    }
}/**
 * Created by YewMoon on 2019/3/26.
 * Main interface control·Item CD
 * @param skill | item data
 * @param bmp1 | image before press
 * @param bmp2 | image after press
 * @param bmp3 | CD image
 * @param bmpKey | shortcut image
 * @param keyStr | data of shortcut
 * @param bmpNum | image of number
 */
function CActorItemCooling(item,bmp1,bmp2,bmp3,bmpKey,keyStr,bmpNum){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //shortcut back，Relative coordinates of inventory slot
    var keyX = 6;
    var keyY = 6;
    //shortcut text，Relative coordinates of shortcutBack
    var keyStrX = 0;
    var keyStrY = - 2;
    //item icon，Relative coordinates of inventory slot
    var tempPicX = 14;
    var tempPicY = 14;
    //board of item number，Relative coordinates of inventory slot
    var numX = 0;
    var numY = 0;
    //text of item number，Relative coordinates of num
    var numStrX = 50;
    var numStrY = 50;
    //CD text，Relative coordinates of inventory slot
    var drawX = 0;
    var drawY = 0;
    //mask，Relative coordinates of inventory slot
    var barX = 0;
    var barY = 0;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    this.enable = true;
    this.width = 0;
    this.height = 0;
    //==================================== Private attributes ===================================
    //data of button
    var data = item;
    //item id
    var dataId = null;
    if(data != 0 && data != null){
        dataId = RV.NowSet.findItemId(item.id);
    }
    //cd time
    var time = dataId == null ? 0 : dataId.cd;
    //temp variable of cd time
    var oldTime = time;
    //item button
    var button = new IButton(bmp1,bmp2,"",null,true);
    button.visible = RV.GameData.uiItems;
    //Get button sprite
    var tempPic = button.getSprite();
    //Shortcut
    var key = new ISprite(bmpKey);
    key.drawTextQ(keyStr,(key.width - IFont.getWidth(keyStr,12)) / 2 + keyStrX,(key.height - IFont.getHeight(keyStr,12)) / 2 + keyStrY,RV.setColor.cBase,12);
    key.visible = IsPC() && RV.GameData.uiItems;
    //CD
    var bar = new IScrollbar(IBitmap.CBitmap(button.width,button.height) , bmp3 , 0 , time);
    bar.dir = 2;
    bar.visible = RV.GameData.uiItems;
    //draw text
    var draw = new ISprite(button.width,button.height,IColor.Transparent());
    draw.visible = false;
    var num = new ISprite(button.width,button.height,IColor.Transparent());
    num.visible = RV.GameData.uiItems;
    this.width = button.width;
    this.height = button.height;
    this.enable = updateEnable();
    //==================================== Private Function ===================================
    /**
     * available status
     */
    function updateEnable(){
        if(dataId == null){
            return true;
        }
        if(RV.NowSet.setItem[dataId.id].userType == 0){
            return false;
        }
        return time <= 0;
    }
    /**
     * change icon opacity
     */
    function updateIcon(){
        tempPic.clearBitmap();
        if(dataId != null && data.num > 0) {
            tempPic.drawBitmap(RF.LoadCache("Icon/" + dataId.icon), tempPicX, tempPicY, false);
            if(_sf.enable == false){
                tempPic.opacity = 0.3;
            }else{
                tempPic.opacity = 1;
            }
        }
    }
    /**
     * flash
     */
    function drawFlash(){
        tempPic.flash(IColor.White(),30)
    }
    /**
     * draw the number of items
     */
    function updateNum(){
        num.clearBitmap();
        if(data.num > 0){
            num.drawBitmap(bmpNum,50,50,false);
            num.drawTextQ(data.num,(bmpNum.width - IFont.getWidth(data.num,10)) / 2 + numStrX,(bmpNum.height - IFont.getHeight(data.num,10)) / 2 + numStrY,RV.setColor.num,10);
        }
    }
    /**
     * draw the text of button
     */
    function drawButton(){
        if(dataId == null) return;
        var str = "";
        if(!_sf.enable){
            bar.setValue(1,1);
        }
        if(oldTime != time ){
            oldTime = time;
            str = (time / 60).toFixed(1) + "";
            drawText(str);
        }else if(time <= 0){
            bar.setValue(0,1);
        }
        if(time <= 0){
            draw.visible = false;
        }
    }
    /**
     * draw Text
     * @param str | text to draw
     */
    function drawText(str){
        draw.clearBitmap();
        draw.visible = true;
        var size = 16;
        var w = IFont.getWidth(str,size);
        draw.drawTextQ(str , (draw.width - w) / 2 , 25 ,RV.setColor.cBase,size);
    }
    //==================================== Public Function ===================================
    /**
     * x of button, text, shortcut,cd bar,number 
     */
    Object.defineProperty(this, "x", {
        get: function () {
            return button.x;
        },
        set: function (value) {
            button.x = value;
            draw.x = value + drawX;
            key.x = value+ keyX;
            bar.x = value + barX;
            num.x = value + numX;
        }
    });
    /**
     * y of button, text, shortcut,cd bar,number 
     */
    Object.defineProperty(this, "y", {
        get: function () {
            return button.y;
        },
        set: function (value) {
            button.y = value;
            draw.y = value + drawY;
            key.y = value + keyY;
            bar.y = value + barY;
            num.y = value + numY;
        }
    });
    /**
     * layer z of button, text, shortcut,cd bar,number
     */
    Object.defineProperty(this, "z", {
        get: function () {
            return button.z;
        },
        set: function (value) {
            button.z = value;
            draw.z = value + 15;
            key.z = value + 18;
            bar.z = value + 8;
            num.z = value + 5;
        }
    });
    /**
     * set visibility of button
     * @param vis | true visible ; false Invisible
     */
    this.setVisible = function(vis){
        button.visible = vis;
        key.visible = vis;
        bar.visible = vis;
        num.visible = vis;
    };

    /**
     * update button
     */
    this.update = function(){
        _sf.enable = updateEnable();
        if(time > 0){
            time -= 1;
            if(time <= 0){
                bar.setValue(0,1);
                _sf.enable = updateEnable();
                updateIcon();
                updateNum();
                drawFlash()
            }else{
                bar.setValue(time,dataId.cd * 60);
            }
        }
        drawButton();
        bar.update();
        if(_sf.enable && button.update()){
            _sf.doThis();
            return true;
        }
        return false;
    };
    /**
     * CD
     */
    this.doThis = function(){
        if(dataId == null || RV.GameData.actor.LItem) return;
        RV.GameData.useItem(data.id,1);
        this.enable = false;
        updateIcon();
        updateNum();
        if(data.num > 0){
            time = dataId.cd * 60;
            bar.setValue(time,dataId.cd * 60);

        }else if(data.num <= 0){
            var index = RV.GameData.userItem.indexOf(data);
            if(index >= 0){
                RV.GameData.userItem[index] = 0;
            }
        }
    };
    /**
     * Dispose
     */
    this.dispose = function(){
        button.dispose();
        draw.dispose();
        key.dispose();
        bar.dispose();
        num.dispose();
    };
    /**
     * set item data
     */
    this.setData = function(item){
        data = item;
        if(data != 0 && data != null){
            dataId = RV.NowSet.findItemId(item.id);
        }
        time = 0;
        _sf.enable = true;
        bar.setValue(0,1);
        draw.clearBitmap();
        updateIcon();
        updateNum();
    };
    /**
     * set item number
     */
    this.setNum = function(item){
        data = item;
        if(data != 0 && data != null){
            dataId = RV.NowSet.findItemId(item.id);
        }
        _sf.enable = true;
        updateIcon();
        updateNum();
    };
    /**
     * Get button
     */
    this.getButton = function(){
        return button;
    };
    /**
     * Get button back
     */
    this.getBack = function(){
        return button.getBack();
    };
    /**
     * whether details can be displayed
     */
    this.canShowTips = function(){
        return (button.update() && IInput.Tlong && button.visible == true) || button.getBack().GetRect().intersects(IInput.x,IInput.y,IInput.x + 1,IInput.y) && button.visible == true;
    };
    /**
     * get date of item
     */
    this.getData = function(){
        return dataId;
    };
}
/**
 * Created by Yitian Chen on 2019/4/8.
 * Main interface control·Skill CD
 * @param skill | skill data
 * @param bmp1 | image before press
 * @param bmp2 | image after press
 * @param bmp3 | CD image
 * @param bmpKey | shortcut image
 * @param keyStr | data of shortcut
 */
function CActorSKillCooling(skill,bmp1,bmp2,bmp3,bmpKey,keyStr){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //shortcut，Relative coordinates of skill slot
    var keyX = 6;
    var keyY = 6;
    //shortcut text，Relative coordinates of shortcutBack
    var keyStrX = 0;
    var keyStrY = - 1;
    //viewPort，Relative coordinates of skill slot
    var viewX = 13;
    var viewY = 13;
    //item icon，Relative coordinates of inventory slot'viewPort
    var tempPicX = 0;
    var tempPicY = 0;
    //CD text，Relative coordinates of skill slot
    var drawX = 0;
    var drawY = 0;
    //mask，Relative coordinates of skill slot
    var barX = 0;
    var barY = 0;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    this.enable = true;
    this.width = 0;
    this.height = 0;
    //==================================== Private attributes ===================================
    //data of button
    var data = skill;
    //cd time
    var time = data == null ? 0 : data.cd;
    //temp variable of cd time
    var oldTime = time;
    //temp variable of available status
    var oldCanUser = false;
    //skill button
    var button = new IButton(bmp1,bmp2,"",null,true);
    button.visible = RV.GameData.uiSkill;
    //viewPort
    var view = new IViewport(0,0,48,48);
    //round viewPort
    view.type = IViewport.Type.Round;
    view.visible = false;
    //Get button sprite
    var tempPic = new ISprite(IBitmap.CBitmap(48,48),view);
    //Shortcut
    var key = new ISprite(bmpKey);
    key.drawTextQ(keyStr,(key.width - IFont.getWidth(keyStr,12)) / 2 + keyStrX,(key.height - IFont.getHeight(keyStr,12)) / 2 + keyStrY,RV.setColor.cBase,12);
    key.visible = IsPC() && RV.GameData.uiSkill;
    //CD
    var bar = new IScrollbar(IBitmap.CBitmap(button.width,button.height) , bmp3 , 0 , time);
    bar.dir = 2;
    bar.visible = RV.GameData.uiSkill;
    //draw text
    var draw = new ISprite(button.width,button.height,IColor.Transparent());
    draw.visible = false;

    this.width = button.width;
    this.height = button.height;
    this.enable = updateEnable();

    //==================================== Private Function ===================================
    /**
     * available status
     */
    function updateEnable(){
        if(data == null){
            return true;
        }
        if(RV.NowSet.setSkill[data.id].userType == 0){
            return false;
        }
        return RV.GameData.actor.mp >= data.useMp && time <= 0;
    }
    /**
     * change icon opacity
     */
    function updateIcon(){
        tempPic.clearBitmap();
        if(data != null) {
            view.visible = RV.GameData.uiSkill;
            tempPic.drawBitmap(RF.LoadCache("Icon/" + data.icon), tempPicX, tempPicY, false);
            if(_sf.enable == false){
                tempPic.opacity = 0.3;
            }else{
                tempPic.opacity = 1;
            }
        }
    }
    /**
     * flash
     */
    function drawFlash(){
        tempPic.flash(IColor.White(),30)
    }
    /**
     * draw the text of button
     */
    function drawButton(){
        if(data == null) return;
        var str = "";
        if(!_sf.enable){
            bar.setValue(1,1);
        }
        if(oldTime != time ){
            oldTime = time;
            str = (time / 60).toFixed(1) + "";
            if(time == 0) str = "";
            drawText(str);
        }else if(time <= 0 && RV.GameData.actor.mp < data.useMp != oldCanUser){
            oldCanUser = RV.GameData.actor.mp < data.useMp;
            if(oldCanUser){
                bar.setValue(1,1);
                str = "MP Lack";
                drawText(str);
            }else{
                bar.setValue(0,1);
            }
        }
        if(time <= 0 && RV.GameData.actor.mp > data.useMp){
            draw.visible = false;
        }
    }
    /**
     * draw Text
     * @param str | text to draw
     */
    function drawText(str){
        draw.clearBitmap();
        draw.visible = RV.GameData.uiSkill;
        var size = 16;
        if(str == "MP Lack") size = 14;
        var w = IFont.getWidth(str,size);
        draw.drawTextQ(str , (draw.width - w) / 2 , 25 ,RV.setColor.cBase,size);
    }
    //==================================== Public Function ===================================
    /**
     *  x of button, text, shortcut,cd bar
     */
    Object.defineProperty(this, "x", {
        get: function () {
            return button.x;
        },
        set: function (value) {
            button.x = value;
            view.x = value + viewX;
            draw.x = value + drawX;
            key.x = value+ keyX;
            bar.x = value + barX;
        }
    });
    /**
     * y of button, text, shortcut,cd bar
     */
    Object.defineProperty(this, "y", {
        get: function () {
            return button.y;
        },
        set: function (value) {
            button.y = value;
            view.y = value + viewY;
            draw.y = value + drawY;
            key.y = value + keyY;
            bar.y = value + barY;
        }
    });
    /**
     * layer z of button, text, shortcut,cd bar
     */
    Object.defineProperty(this, "z", {
        get: function () {
            return button.z;
        },
        set: function (value) {
            button.z = value;
            view.z = value + 2;
            draw.z = value + 15;
            key.z = value + 18;
            bar.z = value + 8
        }
    });
    /**
     *  set visibility of button
     * @param vis | true visible ; false Invisible
     */
    this.setVisible = function(vis){
        button.visible = vis;
        key.visible = vis;
        bar.visible = vis;
        if(vis == true){
            updateIcon();
            drawButton();
        }else{
            view.visible = false;
            draw.visible = false;
        }
    };

    /**
     * update button
     */
    this.update = function(){
        _sf.enable = updateEnable();
        if(time > 0){
            time -= 1;
            if(time <= 0){
                bar.setValue(0,1);
                _sf.enable = updateEnable();
                updateIcon();
                drawFlash(tempPic)
            }else{
                bar.setValue(time,data.cd * 60);
            }
        }
        drawButton();
        bar.update();
        if(_sf.enable && button.update() && RV.GameData.actor.LSkill != true){
            _sf.doThis();
            return true;
        }
        return false;

    };
    /**
     * CD
     */
    this.doThis = function(){
        if(data == null) return;
        time = data.cd * 60;
        if(time <= 0){
            bar.setValue(time,0.1);
        }else{
            bar.setValue(time,data.cd * 60);
        }
        RV.GameData.actor.mp -= data.useMp;
        RV.NowCanvas.playSkill(RV.NowMap.getActor() , data.id , RV.GameData.actor);
        updateIcon();
        this.enable = false;
    };
    /**
     * Dispose
     */
    this.dispose = function(){
        button.dispose();
        draw.dispose();
        key.dispose();
        bar.dispose();
        tempPic.dispose();
        view.dispose();
    };
    /**
     * set skill data
     */
    this.setData = function(skill){
        data = skill;
        time = 0;
        if(data != null){
            oldCanUser = RV.GameData.actor.mp < data.useMp;
            _sf.enable = true;
            bar.setValue(0,1);
            draw.clearBitmap();
        }else{
            _sf.enable = true;
            bar.setValue(0,1);
            draw.clearBitmap();
            view.visible = false;
        }
        updateIcon();
    };
    /**
     * Get button
     */
    this.getButton = function(){
        return button;
    };
    /**
     * Get button back
     */
    this.getBack = function(){
        return button.getBack();
    };
    /**
     * whether details can be displayed
     */
    this.canShowTips = function(){
        return (button.update() && IInput.Tlong && button.visible == true) || button.getBack().GetRect().intersects(IInput.x,IInput.y,IInput.x + 1,IInput.y) && button.visible == true;
    };
    /**
     * get date of skill
     */
    this.getData = function(){
        return data;
    };
}/**
 * Created by YewMoon on 2019/2/20.
 * Main interface control·Actor Status
 */
function CActorStatus(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //HP bar
    var barHPX = 35;
    var barHPY = 15;
    //HP Icon，Relative coordinates of barHp
    var iconHPX = -27;
    var iconHPY = -5;
    //HP volume
    var volHPX = "barHP_left_0";
    var volHPY = barHPY - 11;
    //life number
    var numLifeX = "barHP_right_100";
    var numLifeY = barHPY;
    //MP bar
    var barMPX = 35;
    var barMPY = 43;
    //MP Icon，Relative coordinates of barMp
    var iconMPX = -26;
    var iconMPY = -5;
    //MP volume
    var volMPX = "barMP_left_0";
    var volMPY = barMPY - 11;
    //EXP bar
    var barExpX = 34;
    var barExpY = 68;
    //EXP volume
    var volExpX = "barExp_left_0";
    var volExpY = barExpY - 5;
    //LV，Relative coordinates of barExp
    var lvX = barExpX - 22;
    var lvY = barExpY;
    //Exp Icon，Relative coordinates of barExp
    var iconExpX = -24;
    var iconExpY = 0;
    //gold
    var iconCoinX = 220;
    var iconCoinY = 10;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Private attributes ===================================
    //HP bar
    var barHP = null;
    //HP volume
    var volHP = null;
    //life
    var numLife = null;
    //MP bar
    var barMP = null;
    //MP volume
    var volMP = null;
    //EXP bar
    var barExp = null;
    //EXP volume
    var volExp = null;
    //LV
    var lv = null;
    //life data
    var dataLife = 0;
    //number of gold
    var iconCoin = null;
    //Preload complete
    var loadOver = false;
    //temporary value
    var tempMoney = -1;
    var tempHp = -1;
    var tempHpMax = -1;
    var tempLife = -1;
    var tempMp = -1;
    var tempMpMax = -1;
    var tempExp = -1;
    var tempLv = -1;
    //Preload images
    RF.CacheUIRes(
        [
            "System/bar-actor-hp_0.png",
            "System/bar-actor-hp_1.png",
            "System/bar-actor-hp_2.png",
            "System/icon_hp.png",
            "System/bar-actor-mp_0.png",
            "System/bar-actor-mp_1.png",
            "System/bar-actor-mp_2.png",
            "System/icon_mp.png",
            "System/bar-actor-exp_0.png",
            "System/bar-actor-exp_1.png",
            "System/icon_level.png",
            "System/icon_coin.png"
        ]
        , init);
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        barHP = new IScrollbar(hash["System/bar-actor-hp_0.png"],hash["System/bar-actor-hp_1.png"],RV.GameData.actor.hp,RV.GameData.actor.getMaxHP(),null,
            hash["System/bar-actor-hp_2.png"],hash["System/icon_hp.png"]);
        barHP.x = barHPX;
        barHP.y = barHPY;
        barHP.z = 1005;
        barHP.setIconPoint(iconHPX,iconHPY);
        barHP.visible = RV.GameData.uiHp;
       volHP = new ISprite(barHP.width,barHP.height,IColor.Transparent());
        volHP.x = RF.PointTranslation(_sf , volHP , volHPX , "x");
        volHP.y = volHPY;
        volHP.z = 1010;
        volHP.visible = RV.GameData.uiHp;
        drawHp();
        numLife = new ISprite(100,20,IColor.Transparent());
        numLife.x = RF.PointTranslation(_sf , numLife , numLifeX , "x");
        numLife.y = numLifeY;
        numLife.z = 1010;
        numLife.visible = RV.GameData.uiLife;
        drawLife();
        barMP = new IScrollbar(hash["System/bar-actor-mp_0.png"],hash["System/bar-actor-mp_1.png"],RV.GameData.actor.mp,RV.GameData.actor.getMaxMp(),null,
            hash["System/bar-actor-mp_2.png"],hash["System/icon_mp.png"]);
        barMP.x = barMPX;
        barMP.y = barMPY;
        barMP.z = 1005;
        barMP.setIconPoint(iconMPX,iconMPY);
        barMP.visible = RV.GameData.uiMp;
        volMP = new ISprite(barMP.width,barMP.height,IColor.Transparent());
        volMP.x = RF.PointTranslation(_sf , volMP , volMPX , "x");
        volMP.y = volMPY;
        volMP.z = 1010;
        volMP.visible = RV.GameData.uiMp;
        drawMp();
        barExp = new IScrollbar(hash["System/bar-actor-exp_0.png"],hash["System/bar-actor-exp_1.png"],RV.GameData.actor.exp,RV.GameData.actor.maxExp,null,
            null,hash["System/icon_level.png"]);
        barExp.x = barExpX;
        barExp.y = barExpY;
        barExp.z = 1005;
        barExp.setIconPoint(iconExpX,iconExpY);
        barExp.visible = RV.GameData.uiExp;
        volExp = new ISprite(barExp.width,barExp.height,IColor.Transparent());
        volExp.x = RF.PointTranslation(_sf , volExp , volExpX , "x");
        volExp.y = volExpY;
        volExp.z = 1010;
        volExp.visible = RV.GameData.uiExp;
        drawExp();
        lv = new ISprite(hash["System/icon_level.png"].width,hash["System/icon_level.png"].height,IColor.Transparent());
        lv.x = lvX;
        lv.y = lvY;
        lv.z = barExp.z + 10;
        lv.visible = RV.GameData.uiExp;
        drawLv();
       iconCoin = new ISprite(hash["System/icon_coin.png"].width + 300,hash["System/icon_coin.png"].height,IColor.Transparent());
        iconCoin.x = iconCoinX;
        iconCoin.y = iconCoinY;
        iconCoin.z = 1005;
        iconCoin.visible = RV.GameData.uiMoney;
        drawCoin();
        loadOver = true
    }

    /**
     * set visibility of control
     * @param ctrl 0:HP bar 1:life 2:MP bar 3:EXP bar 4:gold
     * @param visible
     */
    this.setCtrlVisible = function(ctrl,visible){
        if(ctrl == 0){
            barHP.visible = visible;
            volHP.visible = visible;
        }else if(ctrl == 1){
            numLife.visible = visible
        }else if(ctrl == 2){
            barMP.visible = visible;
            volMP.visible = visible;
        }else if(ctrl == 3){
            barExp.visible = visible;
            volExp.visible = visible;
            lv.visible = visible;
        }else if(ctrl == 4){
            iconCoin.visible = visible;
        }
    };


    /**
     * draw gold
     */
    function drawCoin(){
        if(RV.GameData.money != tempMoney){
            tempMoney = RV.GameData.money;
            iconCoin.clearBitmap();
            iconCoin.drawBitmap(RF.LoadCache("System/icon_coin.png"),0,0,false);
            iconCoin.drawText("\\s[16]×" + parseInt(RV.GameData.money),30,(iconCoin.height - IFont.getHeight(RV.GameData.money,16)) / 2,2,RV.setColor.outline,false,16);
        }
    }
    /**
     * draw Hp volume
     */
    function drawHp(){
        if(RV.GameData.actor.hp != tempHp || RV.GameData.actor.getMaxHP() != tempHpMax){
            if(RV.GameData.actor.getMaxHP() != tempHpMax){
                barHP.setValue(0,RV.GameData.actor.getMaxHP());
                barHP.setValue(RV.GameData.actor.hp,RV.GameData.actor.getMaxHP());
                barHP.update();
            }else{
                if(!RV.InterpreterMain.isEnd){
                    barHP.setValue(RV.GameData.actor.hp,RV.GameData.actor.getMaxHP());
                    barHP.update();
                }else{
                    barHP.valueAnimTo(RV.GameData.actor.hp,10);
                }
            }
            tempHp = RV.GameData.actor.hp;
            tempHpMax = RV.GameData.actor.getMaxHP();
            var textHp = "\\s[12]"+ parseInt(RV.GameData.actor.hp) +"/" + parseInt(RV.GameData.actor.getMaxHP());
            if(volHP != null) volHP.clearBitmap();
            if(volHP != null) volHP.drawText(textHp,volHP.width - IFont.getWidth(textHp,12) + 27,0,2,RV.setColor.outline,false,14);
        }
    }
    /**
     * draw life
     */
    function drawLife(){
        if(RV.GameData.life != tempLife){
            tempLife = RV.GameData.life;
            numLife.clearBitmap();
            if(RV.GameData.life == 0){
                dataLife = ""
            }else if(RV.GameData.life < 0){
                dataLife = "∞"
            }else{
                dataLife = "\\s[15]×" + parseInt(RV.GameData.life);
            }
            numLife.drawText(dataLife,5,-1,2,RV.setColor.outline,false,15);
        }
    }
    /**
     * draw Mp
     */
    function drawMp(){
        if(RV.GameData.actor.mp != tempMp || RV.GameData.actor.getMaxMp() != tempMpMax){
            if(RV.GameData.actor.getMaxMp() != tempMpMax){
                barMP.setValue(0,RV.GameData.actor.getMaxMp());
                barMP.setValue(RV.GameData.actor.mp,RV.GameData.actor.getMaxMp());
                barMP.update();
            }else{
                if(!RV.InterpreterMain.isEnd){
                    barMP.setValue(RV.GameData.actor.mp,RV.GameData.actor.getMaxMp());
                    barMP.update();
                }else{
                    barMP.valueAnimTo(RV.GameData.actor.mp,10);
                }
            }
            tempMp = RV.GameData.actor.mp;
            tempMpMax = RV.GameData.actor.getMaxMp();
            var textMp = "\\s[12]"+ parseInt(RV.GameData.actor.mp) +"/" + parseInt(RV.GameData.actor.getMaxMp());
            volMP.clearBitmap();
            volMP.drawText(textMp,volMP.width - IFont.getWidth(textMp,12) + 27,0,2,RV.setColor.outline,false,12);
        }
    }
    /**
     * draw EXP
     */
    function drawExp(){
        if(RV.GameData.actor.exp != tempExp){
            tempExp = RV.GameData.actor.exp;
            var textExp = "\\s[12]"+ parseInt(RV.GameData.actor.exp) +"/" + parseInt(RV.GameData.actor.maxExp);
            volExp.clearBitmap();
            if(RV.GameData.actor.level >= 99) textExp = "\\s[12]" +"Max/Max";
            volExp.drawText(textExp,volExp.width - IFont.getWidth(textExp,12) + 27,0,2,RV.setColor.outline,false,12);
            barExp.setValue(RV.GameData.actor.exp,RV.GameData.actor.maxExp);
        }
    }
    /**
     * draw LV
     */
    function drawLv(){
        if(RV.GameData.actor.level != tempLv){
            tempLv = RV.GameData.actor.level;
            lv.clearBitmap();
            lv.drawTextQ(RV.GameData.actor.level,(lv.width -IFont.getWidth(RV.GameData.actor.level,11)) / 2,(lv.height - IFont.getHeight(RV.GameData.actor.level,11))/ 2 - 2,RV.setColor.cBase,11);
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        drawCoin();
        drawHp();
        drawLife();
        drawMp();
        drawExp();
        drawLv();
        barHP.update();
        barMP.update();
        barExp.update();
    };
    /**
     * Dispose this interface
     */
    this.dispose= function(){
        barHP.dispose();
        volHP.dispose();
        numLife.dispose();
        barMP.dispose();
        volMP.dispose();
        barExp.dispose();
        volExp.dispose();
        lv.dispose();
        iconCoin.dispose();
    }
}/**
 * Created by YewMoon on 2019/3/1.
 * Main interface control·Buff(state)
 */
function CBuff(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //buff horizontal spacing
    var buffGapX = 40;
    //buff vertical spacing
    var buffGapY = 40;
    //buff
    var buffX = 16;
    var buffY = "scene_top_96";
    //Maximum per line
    var buffMaxLine = 4;
    //buffIcon，Relative coordinates of buff
    var buffIconX = 4;
    var buffIconY = 0;
    //buff number，Relative coordinates of buff
    var buffNumberX = 30;
    var buffNumberY = 9;
    //buff text，Relative coordinates of buff
    var buffTextX = 2;
    var buffTextY = 22;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Private attributes ===================================
    //buff sprites array
    var buff = [];
    //length of buffs array
    var tempLength = buff.length;
    //buff sprite
    var buffSprite = null;
    //time limit
    var time = 0;
    //step limit
    var step = 0;
    //time count
    var wait = 0;
    //==================================== Private Function ===================================
    /**
     * filter buff
     */
    function drawBuff(){
        if(RV.GameData.actor.buff.length > tempLength){
            for(var i = 0; i < RV.GameData.actor.buff.length - tempLength; i++){
                var tempNow =  RV.GameData.actor.buff[RV.GameData.actor.buff.length - i - 1];
                var isNew = true;
                for(var j = 0; j < buff.length ; j++){
                    if(buff[j].data.getData().id == tempNow.getData().id){
                        buff[j].tag += 1;
                        buff[j].data.endTime += buff[j].time;
                        buff[j].data.endMove += buff[j].step;
                        isNew = false;
                    }
                }
                if(isNew){
                    var bf = newBuff(RV.GameData.actor.buff.length - i - 1);
                    buff.push(bf);
                }
            }
            tempLength = RV.GameData.actor.buff.length;
        }else if(RV.GameData.actor.buff.length < tempLength){
            tempLength = RV.GameData.actor.buff.length;
        }
    }
    /**
     * draw a buff
     * @param index | buff index
     */
    function newBuff(index){
        buffSprite = new ISprite(60,40,IColor.Transparent());
        buffSprite.z = 1005;
        buffSprite.tag = 1;
        buffSprite.data = RV.GameData.actor.buff[index];
        if(buffSprite.data.endType == 1) buffSprite.time = buffSprite.data.endTime;
        if(buffSprite.data.endType == 3) buffSprite.step = buffSprite.data.endMove - RV.GameData.step;
        return buffSprite;
    }
    /**
     * buff text
     * @param index | buff index
     */
    function buffTips(index){
        buff[index].clearBitmap();
        buff[index].drawBitmap(RF.LoadCache("Icon/" + buff[index].data.getIcon()),buffIconX,buffIconY,false);
        var num = 0;
        if(buff[index].data.endType == 1){
            time = parseInt(buff[index].data.endTime / 60);
            num = Math.ceil(time / (buff[index].time / 60));
            buff[index].drawText("\\S[12]" + time,(28 - IFont.getWidth(time,12)) / 2 + buffTextX,buffTextY,2,RV.setColor.outline,false,100);
        }else if(buff[index].data.endType == 3){
            step = parseInt(buff[index].data.endMove - RV.GameData.step);
            num = Math.ceil(step / buff[index].step);
            buff[index].drawText("\\S[12]" + step + "st.",buffTextX,buffTextY,2,RV.setColor.outline,false,100);
        }else{
            for(var k = 0; k< RV.GameData.actor.buff.length; k++){
                if(RV.GameData.actor.buff[index].getData().id == RV.GameData.actor.buff[k].getData().id){
                    num +=1
                }
            }
        }
        if(num > 1) buff[index].drawText("\\S[12]" + num,buffNumberX - IFont.getWidth(num,12),buffNumberY,2,RV.setColor.outline,false,100);
    }

    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        //if(RV.GameData.actor.buff.length <= 0) return;
        drawBuff();
        wait += 1;
        if(time > 0 && wait >= 60 ){
            time -= 1;
            wait = 0;
        }
        for(var i = 0; i< buff.length; i++) {
            buff[i].x = buffX + buffGapX * (i - buffMaxLine * Math.floor(i / buffMaxLine));
            buff[i].y = RF.PointTranslation(_sf, buff[i], buffY, "y") + buffGapY * Math.floor(i / buffMaxLine);
            buffTips(i);
        if(RV.GameData.actor.buff[i] == null){
            _sf.dispose(i);
            i = -1;
        }else if(buff[i].data.endType == 0){//Remove at Battle End
                if(RV.NowMap.getActor().combatTime <= 0){
                    _sf.dispose(i);
                    i = -1;
                }
            }else if(buff[i].data.endType == 1){//remove by time
                if(time <= 0){
                    _sf.dispose(i);
                    i = -1;
                }
            }else if(buff[i].data.endType == 2){//remove by HP decrease
                if(RV.GameData.actor.sumHp > buff[i].data.endHP){
                    _sf.dispose(i);
                    i = -1;
                }
            }else if(buff[i].data.endType == 3){//remove by Walking
                if(step == 0){
                    _sf.dispose(i);
                    i = -1;
                }
            }
        }
        return true;
  };
    /**
     * Dispose this interface
     */
    this.dispose = function(index){
        buff[index].dispose();
        buff.splice(index,1);
    };
    /**
     * Dispose all the buff
     */
    this.disposeAll = function(){
      for(var i = 0; i<buff.length; i++){
          buff[i].dispose();
      }
        buff = [];
    };
    /**
     * Dispose designated buff
     * @param data | buff index
     */
    this.disposeForData = function(data) {
        for (var i = 0; i < buff.length; i++) {
            if (buff[i].data == data) {
                buff[i].dispose();
                buff.remove(buff[i])
            }
        }
    }
}/**
 * Created by YewMoon on 2019/2/21.
 * Main interface control·Boss HP bar
 * @param enemy | enemyboss data
 */
function CEnemyBossStatus(enemy){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //HP bar
    var barHPX = "scene_right_-140";
    var barHPY = 30;
    //volume of HP
    var volHPX = "barHP_left_0";
    var volHPY = barHPY - 15;
    //enemy name
    var bossNameX = "barHP_left_0";
    var bossNameY = barHPY - 18;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Private attributes ===================================
    //HP bar
    var barHP = null;
    //HP and Max HP of enemyboss
    var volHP = null;
    //Back of boss name
    var bossName = null;
    //Preload complete
    var loadOver = false;
    //temporary Hp
    var tempHp = -1;
    var tempHpMax = -1;
    //Preload images
    RF.CacheUIRes(
        [
            "System/bar-boss-hp_0.png",
            "System/bar-boss-hp_1.png",
            "System/bar-boss-hp_2.png",
            "System/board-boss-name.png"
        ]
        , init);
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        barHP = new IScrollbar(hash["System/bar-boss-hp_0.png"],hash["System/bar-boss-hp_1.png"],enemy.hp,enemy.getMaxHP(),null,
            hash["System/bar-boss-hp_2.png"],hash["System/board-boss-name.png"]);
        barHP.x = RF.PointTranslation(_sf , barHP , barHPX , "x");
        barHP.y = barHPY;
        barHP.z = 1005;
        barHP.setIconPoint(0,-20);
        var base = hash["System/board-boss-name.png"];
        volHP = new ISprite(barHP.width,barHP.height,IColor.Transparent());
        volHP.x = RF.PointTranslation(_sf , volHP , volHPX , "x");
        volHP.y = volHPY;
        volHP.z = 1010;
        drawHp();
        bossName = new ISprite(base.width,base.height,IColor.Transparent());
        bossName.x = RF.PointTranslation(_sf , bossName , bossNameX , "x");
        bossName.y = bossNameY;
        bossName.z = 1020;
        bossName.drawTextQ(enemy.getData().name, (base.width - IFont.getWidth(enemy.getData().name,16)) / 2,(bossName.height - IFont.getHeight(enemy.getData().name,16)) / 2,RV.setColor.cBase,16);
        loadOver = true
    }
    /**
     * draw Hp volume
     */
    function drawHp(){
        if(enemy.hp != tempHp || enemy.getMaxHP() != tempHpMax){
            if(enemy.getMaxHP() != tempHpMax){
                barHP.setValue(enemy.hp,enemy.getMaxHP());
            }else{
                barHP.valueAnimTo(enemy.hp,10);
            }
            tempHp = enemy.hp;
            tempHpMax = enemy.getMaxHP();
            var textHp = "\\s[14]"+ parseInt(enemy.hp) + "/" + parseInt(enemy.getMaxHP());
            volHP.clearBitmap();
            volHP.drawText(textHp,volHP.width - IFont.getWidth(textHp,14) + 28,2,2,RV.setColor.outline,false,14);
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        drawHp();
        barHP.update();
        if(enemy.hp <= 0){
            _sf.dispose();
        }
    };
    /**
     * Dispose this interface
     */
    this.dispose= function(){
        barHP.dispose();
        volHP.dispose();
        bossName.dispose();
    }
}/**
 * Created by Yitian Chen on 2018/6/12.
 * Main interface control·Rocker
 * @param b | back
 * @param t | top
 * @param z | layer z
 */
function CRocker(b,t,z){

    //draw back part
    var back = new ISprite(b);
    back.z = z;
    back.visible = RV.NowSet.setAll.uiPhone;
    //draw top part
    var top = new ISprite(t);
    top.z = z + 1;
    top.visible = RV.NowSet.setAll.uiPhone;
    //initialize coordinates
    var rx = 0;
    var ry = 0;
    var dx = 0;
    var dy = 0;
    var id = -2;

    //type 0  4-dir, 1 8-dir
    this.type = 0;
    //movement type, walk or run
    this.moveType = 0;
    //movement direction
    this.moveDir = 0;


    /**
     * set x
     */
    Object.defineProperty(this, "x", {
        get: function () {
            return back.x;
        },
        set: function (value) {
            back.x = value;
            top.x = back.x + (back.width - top.width) / 2;

        }
    });

    /**
     * set y
     */
    Object.defineProperty(this, "y", {
        get: function () {
            return back.y;
        },
        set: function (value) {
            back.y = value;
            top.y = back.y + (back.height - top.height) / 2;

        }
    });

    /**
     * width of rocker（read - only）
     */
    Object.defineProperty(this, "width", {
        get: function () {
            return back.width;
        }
    });

    /**
     * height of rocker（read - only）
     */
    Object.defineProperty(this, "height", {
        get: function () {
            return back.height;
        }
    });

    /**
     * set visible
     * @param sw
     */
    this.setVisible = function(sw){
        back.visible = sw;
        top.visible = sw;
    };

    /**
     * Main update
     */
    this.update = function(){
        //top part
        if(IInput.touches.length == 0 || back.visible == false){
            rx = 0;
            ry = 0;
            dx = 0;
            dy = 0;
            top.x = back.x + (back.width - top.width) / 2;
            top.y = back.y + (back.height - top.height) / 2;
            id = -2;
            this.moveType = 0;
        }
        var bm = false;
        for(var i = 0;i < IInput.touches.length;i++){
            if((id == -2 && top.isSelect(IInput.touches[i].clientX,IInput.touches[i].clientY)) || id == IInput.touches[i].id){
                top.x += dx;
                top.y += dy;
                //Coordinate correction

                if(id != -2){
                    dx = IInput.touches[i].clientX - rx;
                    dy = IInput.touches[i].clientY - ry;
                }


                rx = IInput.touches[i].clientX;
                ry = IInput.touches[i].clientY;
                id = IInput.touches[i].id;

                //Calculate the last direction
                //Calculate the distance between two points
                var topx = top.x + top.width / 2;
                var topy = top.y + top.height / 2;

                var backx = back.x + back.width / 2;
                var backy = back.y + back.height / 2;

                var _x = topx - backx;
                var _y = topy - backy;
                var xx = 0;
                var dir = 0;
                if(_x >= 0 && _y >= 0){
                    xx = 90;
                    dir = 1;
                }else if(_x >= 0 && _y < 0){
                    xx = 90;
                    dir = 0;
                }else if(_x < 0 && _y < 0){
                    xx = 270;
                    dir = 3
                }else if(_x < 0 && _y >= 0){
                    xx = 270;
                    dir = 2;
                }

                var tan = _y/_x;
                var angle = Math.atan(tan) * 360 / (2 * Math.PI);
                angle += xx;

                if(this.type == 0){ //4-dir
                    if(angle >= 315 || angle < 45){
                        this.moveDir = 3;
                    }else if(angle >= 45 && angle < 135){
                        this.moveDir = 2;
                    }else if(angle >= 135 && angle < 225){
                        this.moveDir = 0;
                    }else if(angle >= 225 && angle < 315){
                        this.moveDir = 1;
                    }
                }else{//8-dir
                    if(angle >= 337.5 || angle < 22.5){
                        this.moveDir = 3;
                    }else if(angle >= 22.5 && angle < 67.5){
                        this.moveDir = 7;
                    }else if(angle >= 67.5 && angle < 112.5){
                        this.moveDir = 2;
                    }else if(angle >= 112.5 && angle < 157.5){
                        this.moveDir = 5;
                    }else if(angle >= 157.5 && angle < 202.5){
                        this.moveDir = 0;
                    }else if(angle >= 202.5 && angle < 247.5){
                        this.moveDir = 4;
                    }else if(angle >= 247.5 && angle < 292.5){
                        this.moveDir = 1;
                    }else if(angle >= 292.5 && angle < 337.5){
                        this.moveDir = 6;
                    }
                }


                //limit
                var r = back.width / 2;

                var hd = (2 * Math.PI * (angle - 90)) / 360;
                var yx = backx + r * Math.cos(hd);
                var yy = backy + r * Math.sin(hd);
                if(dir == 0 && (topx > yx || topy < yy)){
                    cPoint(yx,yy);
                }else if(dir == 1 && (topx > yx || topy > yy)){
                    cPoint(yx,yy);
                }else if(dir == 2 && (topx < yx || topy > yy)){
                    cPoint(yx,yy);
                }else if(dir == 3 && (topx < yx || topy < yy)){
                    cPoint(yx,yy);
                }

                var l = Math.sqrt(_x * _x  + _y * _y);
                if(l > (r / 2)){
                    this.moveType = 2;
                    //log("run")
                }else if(l > (r / 8)){
                    this.moveType = 1;
                    //log("walk")
                }else {
                    this.moveType = 0;
                }

               //var s = ["down","left","right","up","lower left","lower right","upper left","upper right"];
                //log(s[this.moveDir]);
                bm = true;

            }
        }


        if(bm == false){
            rx = 0;
            ry = 0;
            dx = 0;
            dy = 0;
            top.x = back.x + (back.width - top.width) / 2;
            top.y = back.y + (back.height - top.height) / 2;
            id = -2;
            this.moveType = 0;
        }


    };

    /**
     * Coordinate correction of top part
     * @param x | offset x
     * @param y | offset y
     */
    function cPoint(x,y){
        top.x = x - top.width / 2;
        top.y = y - top.height / 2;
    }

    /**
     * Dispose
     */
    this.dispose = function(){
        back.dispose();
        top.dispose();
    }

}/**
 * Created by Yitian Chen on 2019/1/15.
 * Game interface·Example
 */
function WBase(){
    //==================================== Pop-up Window (dialog) sample frame ===================================
    /**
     * Framework description:
     * this.endDo is the callback at the end of the window, and the object type is function.
     *
     * obj is the parameter when callback, here Variable is named for the example, which can be modified.
     * Note: If you sets a pop-up box in UseSMain's setDialog function or setDialogParallel function, you should pay attention that there can only be one parameter in the callback function.
     * If there are multiple Return values, please set the array object.
     *
     * this.update is the refresh of the dialog box content. The return value is bool. If UsesetDialog is called in SMain and the return value is true, all the content of the main interface will be prevented from refreshing.
     * If the dialog is called by UsesetDialogParallel in SMain, no matter what value is returned, it will not prevent the main interface content from refreshing.
     *
     * this.dispose is the dialog Dispose, you need to manually dispose, as in the example of update-when the user presses the ESC key, the Dispose window is called.
     * In the process of dialog Dispose, execute the endDo function to call back.
      *
      * See RF.GameOver () for specific examples;
     */
    var _sf = this;
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    var obj = 0;

    this.update = function(){
        if(IInput.isKeyDown(27)){// press ESC
            obj = 1;
            _sf.dispose();
            return false;
        }
        return true;
    };

    this.dispose = function(){
        if(_sf.endDo != null) _sf.endDo(obj);
    };

}/**
 * Created by YewMoon on 2019/2/25.
 * Game interface·Equipment
 * @param shortcut | shortcut
 */
function WEquipment(shortcut){
    var _sf = this;
    //==================================== Interface coordinates  ===================================
    //viewPort
    var vpX = 0;
    var vpY = 0;
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_-25";
    //title
    var titleX = 0;
    var titleY = 14;
    //Close button
    var buttonCloseX = "back_right_-50";
    var buttonCloseY = "back_top_14";
    //actor image
    var figureX = "back_left_90";
    var figureY = "back_top_125";
    //actorInfo show box
    var actorInfoX = "back_left_200";
    var actorInfoY = "back_top_90";
    //actor name, Relative coordinates of actorInfo
    var nameX = 0;
    var nameY = 10;
    //actor Level, Relative coordinates of actorInfo
    var lvX = 0;
    var lvY = 36;
    //actor EXP, Relative coordinates of actorInfo
    var expX = 0;
    var expY = 62;
    //basicInfo show box
    var basicInfoX = "back_left_76";
    var basicInfoY = "back_top_208";
    //actor life, Relative coordinates of basicInfo
    var lifeNumX = 0;
    var lifeNumY = 0;
    //actor HP, Relative coordinates of basicInfo
    var volHPX = 0;
    var volHPY = 36;
    //actor MP, Relative coordinates of basicInfo
    var volMPX = 0;
    var volMPY = 72;
    //general info show box
    var statisticsInfoX = "back_left_76";
    var statisticsInfoY = "basicInfo_top_128";
    //statisticsInfo horizontal spacing
    var statisticsInfoGapX = 155;
    //statisticsInfo vertical spacing
    var statisticsInfoGapY = 34;
    //equipInfo show box
    var equipInfoX = "back_left_430";
    var equipInfoY = "back_left_110";
    //Equipment slots
    var buttonX = "equipInfo_left_222";
    var buttonY = "equipInfo_top_-12";
    //Equipment slots spacing
    var buttonGap = 70;
    //Equipment Icon, Relative coordinates of back
    var iconX = 4;
    var iconY = 4;
    //offset of choose box，Relative coordinates of Equipment slots
    var chooseBoxX = - 1;
    var chooseBoxY = - 1;
    //Equipment name，Relative coordinates of equipInfo
    var equipNameX = 50;
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Return value
    var equipment = null;
    //viewport
    var vp = null;
    //Back
    var back = null;
    //close button
    var buttonClose = null;
    //actor name、LV、EXP show box
    var actorInfo = null;
    //actor image
    var figure = null;
    //actor life, HP, MP show box
    var basicInfo = null;
    //equipment show box
    var equipInfo = null;
    //equipment data list
    var equipList = [RV.GameData.actor.equips.arms,RV.GameData.actor.equips.helmet,RV.GameData.actor.equips.armor,RV.GameData.actor.equips.shoes,RV.GameData.actor.equips.ornaments];
    //slots of equipment
    var buttonEquip = [];
    //choose box
    var chooseBox = null;
    //selection index
    var selectIndex = 0;
    //general info show box
    var statisticsInfo = null;
    //actor parameter
    var statisticsList = ["Attack： "+ RV.GameData.actor.getWAtk(),"Defence： "+ RV.GameData.actor.getWDef(),"M.Attack： "+ RV.GameData.actor.getMAtk(),
        "M.Defence： "+ RV.GameData.actor.getMDef(),"Speed： "+ RV.GameData.actor.getSpeed(),"Luck： "+ RV.GameData.actor.getLuck()];
    //Dialog window
    var dialog = null;
    //Preload complete
    var loadOver = false;
    //temporary equipment id
    var tempId = 0;
    var resHash = null;
    //List of resources required in this interface
    var resList = ["System/Menu/Equipment/back-main.png",
        "System/button-close_0.png",
        "System/button-close_1.png",
        "System/choose-box.png",
        "System/Menu/Equipment/icon_weapon.png",
        "System/Menu/Equipment/icon_hat.png",
        "System/Menu/Equipment/icon_clothes.png",
        "System/Menu/Equipment/icon_shoes.png",
        "System/Menu/Equipment/icon_accessory.png",
        "System/board-store.png"

    ];
    RF.CacheUIRes(resList,init);
    //==================================== Private functions ===================================
    /**
     * preload function
     * @param hash
     */
    function init(hash) {
        resHash = hash;
        //viewport
        vp = new IViewport(vpX,vpY,IVal.GWidth,IVal.GHeight);
        vp.z = 1500;
        //Back
        back = new ISprite(hash[resList[0]],vp);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1500;
        drawTitle();
        //Close button
        buttonClose = new IButton(hash[resList[1]],hash[resList[2]],"",vp);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1505;
        //draw general info of actor
        drawInfo();
        drawStatisticsInfo();
        //draw a back to show Equipment
        equipInfo = new ISprite(IBitmap.CBitmap(200,buttonGap * 5),vp);
        equipInfo.x = RF.PointTranslation(_sf , equipInfo , equipInfoX , "x");
        equipInfo.y = RF.PointTranslation(_sf , equipInfo , equipInfoY , "y");
        equipInfo.z = 1510;
        for(var i = 0; i< 5; i++){
            var tempButton = new IButton(hash[resList[9]],hash[resList[9]],"",vp,true);
            tempButton.x = RF.PointTranslation(_sf , tempButton , buttonX , "x");
            tempButton.y = RF.PointTranslation(_sf , tempButton , buttonY , "y") + i * buttonGap;
            tempButton.z = 1510;
            buttonEquip[i] = tempButton;
        }
        //draw Equipment Icon
        drawIcon();
        //choose box
        if(IsPC()){
            chooseBox = new ISprite(hash[resList[3]],vp);
            chooseBox.x = buttonEquip[0].x + chooseBoxX;
            chooseBox.y = buttonEquip[0].y + chooseBoxY;
            chooseBox.z = 1550;
        }
        loadOver = true;
    }
    /**
     * Draw Title and text
     */
    function drawTitle(){
        var title = "Equipment"
        back.drawTextQ(title,(back.width - IFont.getWidth(title,30)) / 2 + titleX,titleY,RV.setColor.wBase,30);
    }
    /**
     * draw image, name, LV and EXP
     */
    function drawInfo(){
        if(actorInfo != null) actorInfo.dispose();
        if(figure != null) figure.disposeBase();
        //draw image
        figure = new LCharacters(RV.NowRes.findResActor(RV.GameData.actor.getSetData().actorId),vp,1510,null,null);
        figure.CanPenetrate = true;
        figure.mustXY(RF.PointTranslation(_sf , figure , figureX , "x"),RF.PointTranslation(_sf , figure , figureY , "y"));
        actorInfo = new ISprite(IBitmap.CBitmap(180,90),vp);
        actorInfo.x = RF.PointTranslation(_sf , actorInfo , actorInfoX , "x");
        actorInfo.y = RF.PointTranslation(_sf , actorInfo , actorInfoY , "y");
        actorInfo.z = 1510;
        actorInfo.drawTextQ(RV.GameData.actor.name,nameX,nameY,RV.setColor.wBase,16);
        actorInfo.drawTextQ("LV "+RV.GameData.actor.level,lvX,lvY,RV.setColor.wBase,14);
        if(RV.GameData.actor.level >= 99){
            actorInfo.drawTextQ("EXP : " + "Max/Max",expX,expY,RV.setColor.wBase,14);
        }else{
            actorInfo.drawTextQ("EXP : " + RV.GameData.actor.exp+" / "+RV.GameData.actor.maxExp,expX,expY,RV.setColor.wBase,14);
        }
    }
    /**
     * draw life, HP, MP and parameter
     */
    function drawStatisticsInfo(){
        if(basicInfo != null) basicInfo.dispose();
        if(statisticsInfo != null) statisticsInfo.dispose();
        //life
        basicInfo = new ISprite(IBitmap.CBitmap(310,120),vp);
        basicInfo.x = RF.PointTranslation(_sf , basicInfo , basicInfoX , "x");
        basicInfo.y = RF.PointTranslation(_sf , basicInfo , basicInfoY , "y");
        basicInfo.z = 1510;
        basicInfo.drawTextQ("Life ： " + RV.GameData.life,lifeNumX,lifeNumY,RV.setColor.wBase,16);
        //HP
        basicInfo.drawTextQ("HP : "+ RV.GameData.actor.hp + "/" + RV.GameData.actor.getMaxHP(),volHPX,volHPY,RV.setColor.wBase,16);
        //MP
        basicInfo.drawTextQ("MP : "+ RV.GameData.actor.mp + "/" + RV.GameData.actor.getMaxMp(),volMPX,volMPY,RV.setColor.wBase,16);
        //parameter of actor
        statisticsInfo = new ISprite(IBitmap.CBitmap(310,200),vp);
        statisticsInfo.x = RF.PointTranslation(_sf , statisticsInfo , statisticsInfoX , "x");
        statisticsInfo.y = RF.PointTranslation(_sf , statisticsInfo , statisticsInfoY , "y");
        statisticsInfo.z = 1510;
        for(var j = 0; j < 6; j++){
            if(j < 3){
                statisticsInfo.drawTextQ(statisticsList[j],0,j * statisticsInfoGapY,RV.setColor.wBase,16);
            }else{
                statisticsInfo.drawTextQ(statisticsList[j],statisticsInfoGapX,(j - 3) * statisticsInfoGapY,RV.setColor.wBase,16);
            }

        }
    }
    /**
     * draw Equipment Icon and name
     */
    function drawIcon(){
        equipInfo.clearBitmap();
        for(var i = 0; i< 5; i++){
            var tempIcon = buttonEquip[i].getSprite();
            tempIcon.clearBitmap();
            equipInfo.drawBitmap(RF.LoadCache(resList[i + 4]),0,i * buttonGap,false);
            var equipName = null;
            var equipNameColor = null;
            var equipPic = null;
            if(equipList[i] == 0){
                equipName = "None";
                equipNameColor = RV.setColor.unused;
            }else{
                if(i == 0){
                    equipName = RV.NowSet.findArmsId(equipList[i]).name;
                    equipPic = RF.LoadCache("Icon/" + RV.NowSet.findArmsId(equipList[i]).icon);
                }else{
                    equipName = RV.NowSet.findArmorId(equipList[i]).name;
                    equipPic = RF.LoadCache("Icon/" + RV.NowSet.findArmorId(equipList[i]).icon);
                }
                equipNameColor = RV.setColor.wBase;
                //draw equipment Icon
                tempIcon.drawBitmap(equipPic,iconX,iconY,false);
            }
            equipInfo.drawTextQ(equipName,equipNameX,i * buttonGap + 3,equipNameColor,16);
        }
    }
    /**
     * filter weapon and armor
     * @param index | type of equipment
     */
    function filter(index){
        tempId = 0;
        if(index == 0 && equipList[index] != 0){
            tempId = RV.NowSet.findArmsId(equipList[index]).id;

        }else if(equipList[index] != 0){
            tempId = RV.NowSet.findArmorId(equipList[index]).id;
        }
    }
    /**
     * update actor parameter display
     * @param index | type of equipment
     * @param id | current equipment id of this type
     */
    function updateButton(index,id){
        vp.visible = false;
        if(shortcut != null) shortcut.shortcutList(8);
        dialog = new WEquipmentBag(index,id);
        dialog.endDo = function(e){
            dialog = null;
            RV.GameData.actor.updateEquip();
            RV.GameSet.playEquipSE();
            equipList = [RV.GameData.actor.equips.arms,RV.GameData.actor.equips.helmet,RV.GameData.actor.equips.armor,RV.GameData.actor.equips.shoes,RV.GameData.actor.equips.ornaments];
            statisticsList = ["Attack： "+ RV.GameData.actor.getWAtk(),"Defence： "+ RV.GameData.actor.getWDef(),"M.Attack： "+ RV.GameData.actor.getMAtk(),
                "M.Defence： "+ RV.GameData.actor.getMDef(),"Speed： "+ RV.GameData.actor.getSpeed(),"Luck： "+ RV.GameData.actor.getLuck()];
            vp.visible = true;
            drawIcon();
            drawInfo(resHash);
            drawStatisticsInfo();
            if(shortcut != null) shortcut.shortcutList(1);
        };
    }
    /**
     * update PC key selection
     */
    function updatePCKey(){
        if(chooseBox == null) return;
        var tempSelectIndex = -1;
        //down
        if(IInput.isKeyDown(RC.Key.down)){
            tempSelectIndex = selectIndex + 1;
            if(tempSelectIndex > buttonEquip.length - 1) tempSelectIndex = 0;
            updateBlock(tempSelectIndex);
            return true;
        }
        //up
        if(IInput.isKeyDown(RC.Key.up)){
            tempSelectIndex = selectIndex - 1;
            if(tempSelectIndex < 0) tempSelectIndex = buttonEquip.length - 1;
            updateBlock(tempSelectIndex);
            return true;
        }
        //press confirm button
        if(IInput.isKeyDown(RC.Key.ok)){
            RV.GameSet.playEnterSE();
            buttonEquip[selectIndex].update();
            filter(selectIndex);
            updateButton(selectIndex,tempId);
            return true;
        }
        //press cancel button
        if(IInput.isKeyDown(RC.Key.cancel)){
            RV.GameSet.playCancelSE();
            _sf.dispose(0);
            return true
        }
    }
    /**
     * update choose box
     * @param index | type index of Equipment
     */
    function updateBlock(index){
        if(chooseBox == null) return;
        if(index != selectIndex){
            chooseBox.y = buttonEquip[index].y + chooseBoxX ;
            selectIndex = index;
            RV.GameSet.playSelectSE();
        }
    }
    //====================================  Public Function  ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if(figure != null) {
            figure.correctShowPosition();
            figure.updateBase();
        }
        if (!loadOver) return true;
        if (dialog != null && dialog.update()) return true;
        if(updatePCKey()) return true;
        for(var i = 0; i < buttonEquip.length; i++){
            if(buttonEquip[i].update()){
                RV.GameSet.playEnterSE();
                updateBlock(i);
                filter(i);
                updateButton(i,tempId);
                return true
            }
        }
        if(buttonClose.update() || IInput.isKeyDown(RC.Key.cancel)){//press cancel button
            RV.GameSet.playCancelSE();
            _sf.dispose(0);
            return true;
        }
        return true;
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(){
        if(_sf.endDo != null) _sf.endDo(equipment);
        vp.dispose();
        back.dispose();
        buttonClose.dispose();
        actorInfo.dispose();
        figure.disposeBase();
        basicInfo.dispose();
        equipInfo.dispose();
        for(var i = 0; i < buttonEquip.length; i++){
            buttonEquip[i].dispose();
        }
        if(chooseBox != null) chooseBox.dispose();
        statisticsInfo.dispose();
    };
}
/**
 * Created by YewMoon on 2019/3/17.
 * Game interface·Equipment·Equipmengt Bag
 * @param index | type of Equipment
 * @param id | current equipment id of this type
 */
function WEquipmentBag(index,id){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_-25";
    //title
    var titleX = 0;
    var titleY = 14;
    //viewPort
    var vpX = "back_left_60";
    var vpY = "back_top_100";
    //Close button
    var buttonCloseX = "back_right_-30";
    var buttonCloseY = "back_top_14";
    //slots of bag
    var buttonItemX = 5;
    var buttonItemY = 1;
    //slots horizontal spacing
    var buttonItemGapX = 16;
    //slots Vertical spacing
    var buttonItemGapY = 16;
    //Maximum per line
    var buttonMaxLine = 4;
    //offset of choose box，Relative coordinates of slot
    var chooseBoxX = - 1;
    var chooseBoxY = - 1;
    //details box
    var mainDetailsX = "back_right_400";
    var mainDetailsY = "back_top_0";
    //Unload button
    var buttonUnloadX = "mainDetails_right_-28";
    var buttonUnloadY = "mainDetails_top_14";
    //alternative details box
    var candidateDetailsX = "back_right_400";
    var candidateDetailsY = "back_top_0";
    //spacing between two details boxes
    var detailsGap = 474;
    //Change/Equip button
    var buttonChangeX = "candidateDetails_right_-28";
    var buttonChangeY = "candidateDetails_top_14";
    //arrow
    var spriteArrowX = "candidateDetails_right_-30";
    var spriteArrowY = "back_center_0";
    //Show details-Equipment type icon，Relative coordinates of details box
    var logoX = 34;
    var logoY = 22;
    //Show details-Equipment name，Relative coordinates of details box
    var nameX = 70;
    var nameY = 26;
    //Show details-Equipment board，Relative coordinates of details box
    var boardX = 30;
    var boardY = 72;
    //Show details-Equipment Icon offset，Relative coordinates of details box
    var iconX = 4;
    var iconY = 4;
    //Show details-description，Relative coordinates of details box
    var msgX = 94;
    var msgY = 71;
    //compare area, this board showed the gap between two equipments
    var compareBackX = "candidateDetails_left_10";
    var compareBackY = "back_center_-10";
    //text of compare area，Relative coordinates of compareBack
    var textX = 4;
    //text vertical spacing
    var textGap = 20;
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //current equipment id
    var equipId = id;
    //type 1：weapon 2：armor
    var bagType = 0;
    //items of current actor
    var data = RV.GameData.items;
    //data of Equipment bag
    var bagData = [];
    //Back
    var back = null;
    //viewPort
    var vp = null;
    //details box
    var bagDetails = null;
    //Close button
    var buttonClose = null;
    //slots of bag
    var buttonBag = [];
    //choose box
    var chooseBox = null;
    //selection index
    var selectIndex = 0;
    var resHash = null;
    //Function shorthand
    var find = null;
    //data of selected item
    var nowData = null;
    //Unload button
    var buttonUnload = null;
    //Change button
    var buttonChange = null;
    //details box
    var mainDetails = null;
    //alternative details box
    var candidateDetails = null;
    //compare area, this board showed the gap between two equipments
    var compareBack = null;
    //arrow
    var spriteArrow = null;
    //Preload complete
    var loadOver = false;
    //List of resources required in this interface
    var resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/Equipment/icon_weapon.png",
        "System/Menu/Equipment/icon_hat.png",
        "System/Menu/Equipment/icon_clothes.png",
        "System/Menu/Equipment/icon_shoes.png",
        "System/Menu/Equipment/icon_accessory.png",
        "System/board-store.png",
        "System/Menu/Equipment/back-bag.png",
        "System/Menu/Equipment/pic-arrow.png",
        "System/Menu/Equipment/back-details.png",
        "System/Menu/button-function_0.png",
        "System/Menu/button-function_1.png",
        "System/Menu/button-function_2.png",
        "System/choose-box.png"
    ];
    //==================================== Private functions ===================================
    /**
     * filter bag
     */
    bagFilter(index,equipId);
    function bagFilter(index,id){
        if(index == 0){
            bagType = 1;
            find = RV.NowSet.findArmsId
        }else{
            bagType = 2;
            find = RV.NowSet.findArmorId
        }
        for(var i = 0; i<data.length; i++){
            if(bagType == 1 && data[i].type == bagType && RV.GameData.actor.getSetData().attackType == find(data[i].id).type){
                if(data[i].id !== id) bagData.push(data[i]);
            }else if(bagType == 2 && data[i].type == bagType){
                if(index == 1 && find(data[i].id).type == 0){
                    if(data[i].id !== id) bagData.push(data[i]);
                }else if(index == 2 && find (data[i].id).type == 1){
                    if(data[i].id !== id) bagData.push(data[i]);
                }else if(index == 3 && find (data[i].id).type == 2){
                    if(data[i].id !== id) bagData.push(data[i]);
                }else if(index == 4 && find (data[i].id).type == 3){
                    if(data[i].id !== id) bagData.push(data[i]);
                }
            }
        }
    }

    RF.CacheUIRes(resList,init);
    /**
     * preload function
     * @param hash
     */
    function init(hash) {
        resHash = hash;
        back = new ISprite(hash[resList[8]]);
        var backRect = new IRect(0,0,back.width * 2,back.height);
        back.x = RF.PointTranslation(_sf , backRect , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1600;
        drawTitle();
        buttonClose = new IButton(hash[resList[0]], hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1610;
        vp = new IViewport(0,0,300,346);
        vp.x = RF.PointTranslation(_sf , vp , vpX , "x");
        vp.y = RF.PointTranslation(_sf , vp , vpY , "y");
        vp.z = 1620;
        vp.isAutoMove = true;
        vp.dir = IViewport.Dir.Vertical;
        //draw bag
        var buttonLength = bagData.length;
        if(buttonLength <= 0){
            buttonLength = 5 * buttonMaxLine;
        }
        for(var i = 0;i< buttonLength ;i++){
            var button = initInventoryButton(hash ,
                i >= bagData.length ? 0 : bagData[i], vp);
            button.x = (i % buttonMaxLine) *(button.width + buttonItemGapX) + buttonItemX;
            button.y = parseInt(i / buttonMaxLine) *(button.height + buttonItemGapY) + buttonItemY;
            button.z = 1630;
            buttonBag.push(button);
        }
        chooseBox = new ISprite(hash[resList[14]],vp);
        chooseBox.x = buttonBag[0].x + chooseBoxX;
        chooseBox.y = buttonBag[0].y + chooseBoxY;
        chooseBox.z = 1640;
        if(equipId != 0){
            showMainDetails(hash,equipId,index);
            updateDetails(0)
        }else{
            updateDetails(0)
        }
        loadOver = true;
    }
    /**
     * Draw Title and text
     */
    function drawTitle(){
        var title = "Equipments Bag"
        back.drawTextQ(title,(back.width - IFont.getWidth(title,30)) / 2 + titleX,titleY,RV.setColor.wBase,30);
    }
    /**
     * initialize bag slots
     * @param hash 
     * @param item | data of Equipment
     * @param viewPort | viewport
     */
    function initInventoryButton(hash , item , viewPort){
        var tempButton = new IButton(hash[resList[7]], hash[resList[7]],"",viewPort , true);
          //Set image of button disable status
        tempButton.setEnableBitmap(hash[resList[7]]);
        if(item.id >= 0){
            drawItemButton(tempButton,item);
        }
        tempButton.tag = item;
        return tempButton;
    }
    /**
     * draw equipment icon
     * @param button | button board
     * @param item | data of Equipment
     */
    function drawItemButton(button,item){
        if(item.id >= 0){
            var cof = null;
            cof = find(item.id);
            var tempPic = button.getSprite();
            tempPic.clearBitmap();
            if(cof != null) {
                tempPic.drawBitmap(RF.LoadCache("Icon/" + cof.icon),iconX,iconY,false);
            }

        }
        button.tag = item;
    }

    /**
     * update choose box
     * @param index | index of item button
     */
    function updateChoose(index){
        if(chooseBox == null) return;
        if(index != selectIndex){
            if(buttonBag[index].tag.id > 0){
                chooseBox.x = buttonBag[index].x + chooseBoxX;
                chooseBox.y = buttonBag[index].y + chooseBoxY;
                selectIndex = index;
            }
            RV.GameSet.playSelectSE();
        }
    }
    /**
     * show details of equipment
     * @param hash
     * @param id | id of Equipment
     * @param equipType | Equipment type 0：weapon 1：Helmet 2：Armor 3：Shoes 4：Accessory
     */
    function showMainDetails(hash,id,equipType){
        mainDetails = new ISprite(hash[resList[10]]);
        mainDetails.x = RF.PointTranslation(_sf , mainDetails , mainDetailsX , "x");
        mainDetails.y = RF.PointTranslation(_sf , mainDetails , mainDetailsY , "y");
        mainDetails.z = 1600;
        buttonUnload = new IButton(hash[resList[11]],hash[resList[12]]," ",null,true);
        buttonUnload.x = RF.PointTranslation(_sf , buttonUnload , buttonUnloadX , "x");
        buttonUnload.y = RF.PointTranslation(_sf , buttonUnload , buttonUnloadY , "y");
        buttonUnload.z = 1610;
        buttonUnload.drawTitleQ("Unload",RV.setColor.wBase,14);
        showDetails(hash, mainDetails, id, equipType)
    }
    /**
     * show details of alternative equipment
     * @param hash
     * @param id | id of Equipment
     * @param equipType | Equipment type 0：weapon 1：Helmet 2：Armor 3：Shoes 4：Accessory
     */
    function showCandidateDetails(hash,id,equipType){
        if(buttonChange != null) buttonChange.disposeMin();
        if(spriteArrow != null) spriteArrow.disposeMin();
        var position = 0;
        if(equipId != 0) position = 1;
        if(candidateDetails != null) candidateDetails.disposeMin();
        candidateDetails = new ISprite(hash[resList[10]]);
        candidateDetails.x = RF.PointTranslation(_sf , candidateDetails , candidateDetailsX , "x");
        candidateDetails.y = RF.PointTranslation(_sf , candidateDetails , candidateDetailsY , "y") + position * (detailsGap - candidateDetails.height);
        candidateDetails.z = 1600;

        buttonChange = new IButton(hash[resList[11]],hash[resList[12]]," ",null,false);
        buttonChange.x = RF.PointTranslation(_sf , buttonChange , buttonChangeX , "x");
        buttonChange.y = RF.PointTranslation(_sf , buttonChange , buttonChangeY , "y");
        buttonChange.z = 1610;
        if(equipId != 0){
            buttonChange.drawTitleQ("Change",RV.setColor.wBase,14);
        }else{
            buttonChange.drawTitleQ("Equip",RV.setColor.wBase,14);
        }
        if(position == 1){
            spriteArrow = new ISprite(hash[resList[9]]);
            spriteArrow.x = RF.PointTranslation(_sf , spriteArrow , spriteArrowX , "x");
            spriteArrow.y = RF.PointTranslation(_sf , spriteArrow , spriteArrowY , "y");
            spriteArrow.z = 1610;
            buttonChange.tag = 1
        }
        //shortcut
        showDetails(hash,candidateDetails,id,equipType)
    }
    /**
     * draw details box
     * @param hash
     * @param bagDetails | sprite
     * @param id | Equipid
     * @param equipType | Equipment type 0：weapon 1：Helmet 2：Armor 3：Shoes 4：Accessory
     */
    function showDetails(hash,bagDetails,id,equipType){
        var cof = find(id);
        bagDetails.drawBitmap(hash[resList[equipType + 2]],logoX,logoY,false);
        bagDetails.drawTextQ(cof.name,nameX,nameY,RV.setColor.wBase,16);
        bagDetails.drawBitmap(hash[resList[7]],boardX,boardY,false);
        bagDetails.drawBitmap(RF.LoadCache("Icon/" + cof.icon),boardX + iconX,boardY + iconY,false);
        bagDetails.drawText("\\s[14]" + cof.msg,msgX,msgY,0,RV.setColor.wBase,true,340);
    }
    /**
     * shop compare area
     * @param mainId | id of current equipped equipment
     * @param candidateId | id of selected equipment
     */
    function updateCompare(mainId,candidateId){
        if(compareBack != null) compareBack.dispose();
        var statisticsInfo = [];
        var type = [];
        var mainData = [find(mainId).maxHP,find(mainId).maxMP,find(mainId).watk,find(mainId).wdef,find(mainId).matk,find(mainId).mdef,find(mainId).speed,find(mainId).luck];
        var candidateData = [find(candidateId).maxHP,find(candidateId).maxMP,find(candidateId).watk,find(candidateId).wdef,find(candidateId).matk,find(candidateId).mdef,find(candidateId).speed,find(candidateId).luck];
        var compareName = ["Max HP","Max MP","Attack","Defence","M.Attack","M.Defence","Speed","Luck"];
        for(var i = 0; i< mainData.length; i++){
            if(mainData[i] != candidateData[i] ){
                var str = mainData[i] - candidateData[i];
                statisticsInfo.push(str);
                type.push(compareName[i]);
            }
        }
        compareBack = new ISprite(180,statisticsInfo.length * 20,RV.setColor.show);
        compareBack.x = RF.PointTranslation(_sf , compareBack , compareBackX , "x");
        compareBack.y = RF.PointTranslation(_sf , compareBack , compareBackY , "y");
        compareBack.z = 1730;
        compareBack.opacity = 0.9;
        for(i = 0;i<statisticsInfo.length;i++){
            if(statisticsInfo[i] > 0){
                compareBack.drawTextQ(type[i] + " : " + statisticsInfo[i] + "     ↓",textX,i* textGap,RV.setColor.wBase,14)
            }else{
                compareBack.drawTextQ(type[i] + " : " + statisticsInfo[i] * (-1) + "     ↑",textX,i* textGap,RV.setColor.wBase,14)
            }
        }
    }
    /**
     * logic of equip and unload
     * @param data | data of current type
     */
    function updateControlButton(data){
        if(data == null){
            RV.GameData.actor.equipUnload(index);
        }else if(buttonChange.tag == 1){
            RV.GameData.actor.equipUnload(index);
            RV.GameData.actor.equipLoad(data);
        }else{
            RV.GameData.actor.equipLoad(data);

        }
        bagData = [];
        _sf.dispose(0)
    }
    /**
     * update compare area
     * @param i | index of bag slots
     */
    function updateDetails(i){
        if(bagData.length > 0){
            showCandidateDetails(resHash,bagData[i].id,index);
        }
        if(spriteArrow != null) updateCompare(equipId,bagData[i].id);
        nowData = bagData[i];
    }
    /**
     * update PC key selection
     */
    function updatePCKey(){
        if(chooseBox != null){
            var tempSelectIndex = -1;
            //down
            if(IInput.isKeyDown(RC.Key.down)){
                tempSelectIndex = selectIndex + buttonMaxLine;
                if(tempSelectIndex > buttonBag.length - 1) tempSelectIndex = buttonBag.length - 1;
                updateChoose(tempSelectIndex);
                updateDetails(tempSelectIndex);
                if(chooseBox.y >= vp.height) vp.oy = - (chooseBox.y - 4 *(chooseBox.height + buttonItemGapY) + buttonItemGapY);
                return true;
            }
            //up
            if(IInput.isKeyDown(RC.Key.up)){
                tempSelectIndex = selectIndex - buttonMaxLine;
                if(tempSelectIndex < 0) tempSelectIndex = selectIndex;
                updateChoose(tempSelectIndex);
                updateDetails(tempSelectIndex);
                if(chooseBox.y <= chooseBox.height + buttonItemGapY) vp.oy = - chooseBox.y;
                return true;
            }
            //right
            if(IInput.isKeyDown(RC.Key.right)){
                tempSelectIndex = selectIndex + 1;
                if(tempSelectIndex > buttonBag.length - 1) tempSelectIndex = buttonBag.length - 1;
                updateChoose(tempSelectIndex);
                updateDetails(tempSelectIndex);
                if(chooseBox.y >= vp.height) vp.oy = - (chooseBox.y - 4 *(chooseBox.height + buttonItemGapY) + buttonItemGapY);
                return true;
            }
            //left
            if(IInput.isKeyDown(RC.Key.left)){
                tempSelectIndex = selectIndex - 1;
                if(tempSelectIndex < 0) tempSelectIndex = selectIndex;
                updateChoose(tempSelectIndex);
                updateDetails(tempSelectIndex);
                if(chooseBox.y <= chooseBox.height + buttonItemGapY + buttonItemY) vp.oy = - chooseBox.y;
                return true;
            }
            //press Unload button
            if(buttonUnload != null && IInput.isKeyDown(RC.Key.run)){
                updateControlButton(null);
                return true;
            }
            //press Change/Equip button
            if(buttonChange != null && IInput.isKeyDown(RC.Key.ok)){
                updateControlButton(nowData);
                return true
            }
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if(updatePCKey()) return true;
        vp.updateMove();
        if(buttonClose.update() || IInput.isKeyDown(RC.Key.cancel)){
            RV.GameSet.playCancelSE();
            _sf.dispose(0);
            return true;
        }
        for(var i = 0; i < buttonBag.length; i++){
            if(buttonBag[i].update() && buttonBag[i].getEnable()){
                RV.GameSet.playEnterSE();
                updateChoose(i);
                updateDetails(i);
                return true
            }
        }
        if(buttonUnload != null && buttonUnload.update()){
            RV.GameSet.playEnterSE();
            updateControlButton(null)
            return true
        }
        if(buttonChange != null && buttonChange.update()){
            RV.GameSet.playEnterSE();
            updateControlButton(nowData)
            return true
        }
        return true;
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(equip){
        if (_sf.endDo != null) _sf.endDo(equip);
        back.dispose();
        vp.dispose();
        buttonClose.dispose();
        if(buttonUnload != null) buttonUnload.dispose();
        if(buttonChange != null) buttonChange.dispose();
        if(mainDetails != null) mainDetails.dispose();
        if(candidateDetails != null) candidateDetails.dispose();
        if(bagDetails != null) bagDetails.dispose();
        if(compareBack != null) compareBack.dispose();
        if(spriteArrow != null) spriteArrow.dispose();
    };
}/**
 * Created by YewMoon on 2019/1/20.
 * Game interface·Game Over
 */
function WGameOver() {
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //cover
    var coverX = 0;
    var coverY = 0;
    //title
    var spriteTitleX = "scene_center_0";
    var spriteTitleY = "scene_center_-90";
    //button - to title
    var buttonBackMenuX = "spriteTitle_left_-30";
    var buttonBackMenuY = "spriteTitle_bottom_170";
    //button - replay
    var buttonReplayX = "spriteTitle_right_30";
    var buttonReplayY = "spriteTitle_bottom_170";
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Return value
    var fail = 0;
    //cover
    var cover = null;
    //text"GAME OVER"
    var spriteTitle = null;
    //"to title" button
    var buttonBackMenu = null;
    //"replay" button
    var buttonReplay = null;
    //shortcut
    var shortcut = null;

    var loadOver = false;
    //List of resources required in this interface
    var resList = [
        "System/GameOver/text-title.png",
        "System/button-all_0.png",
        "System/button-all_1.png",];

    //preload images
    RF.CacheUIRes(resList, init);
    //==================================== Private functions ===================================
    /**
     * preload function
     * @param hash
     */
    function init(hash) {
        cover = new ISprite(IVal.GWidth, IVal.GHeight, IColor.Black());
        cover.visible = false;
        cover.x = coverX;
        cover.y = coverY;
        cover.z = 1499;
        //sprite of "GAME OVER"
        spriteTitle = new ISprite(hash[resList[0]]);
        spriteTitle.visible = false;
        spriteTitle.x = RF.PointTranslation(_sf , spriteTitle , spriteTitleX , "x");
        spriteTitle.y = RF.PointTranslation(_sf , spriteTitle , spriteTitleY , "y");
        spriteTitle.z = 1505;

        buttonBackMenu = new IButton(hash[resList[1]], hash[resList[2]],"To Title");
        buttonBackMenu.visible = false;
        buttonBackMenu.x = RF.PointTranslation(_sf , buttonBackMenu , buttonBackMenuX , "x");
        buttonBackMenu.y = RF.PointTranslation(_sf , buttonBackMenu , buttonBackMenuY , "y");
        buttonBackMenu.z = 1505;

        buttonReplay = new IButton(hash[resList[1]], hash[resList[2]],"Load Game");
        buttonReplay.visible = false;
        buttonReplay.x = RF.PointTranslation(_sf , buttonReplay , buttonReplayX , "x");
        buttonReplay.y = RF.PointTranslation(_sf , buttonReplay , buttonReplayY , "y");
        buttonReplay.z = 1505;

        loadOver = true;
        //animation of game over
        gameOverAnimation();
        if(IsPC()){
            shortcut = new WShortcut();
            shortcut.shortcutList(13)
        }
    }
    /**
     * animation
     */
    function gameOverAnimation(){
        
        spriteTitle.fade(0,1,20);
        buttonBackMenu.fade(0,1,20);
        buttonReplay.fade(0,1,20);
        cover.opacity = 0.7;
        spriteTitle.visible = true;
        buttonBackMenu.visible = true;
        buttonReplay.visible = true;
        cover.visible = true;
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function () {
        if (!loadOver) return true;
        if (buttonBackMenu.update() || IInput.isKeyDown(RC.Key.cancel)) {//press "to title" button
            RV.GameSet.playEnterSE();
            _sf.dispose(1);
            return true;
        }
        if (buttonReplay.update() || IInput.isKeyDown(RC.Key.ok)) {//press "replay" button
            RV.GameSet.playEnterSE();
            _sf.dispose(2);
            return true;
        }
        return true;
    };
    /**
     * Dispose this interface
     */
    this.dispose = function (fail) {
        if (_sf.endDo != null) _sf.endDo(fail);
        IInput.keyCodeAry = [];
        spriteTitle.dispose();
        buttonReplay.dispose();
        buttonBackMenu.dispose();
        cover.dispose();
        if(shortcut != null) shortcut.dispose();
    };
}/**
 * Created by YewMoon on 2019/1/22.
 * Game interface·Victory
 */
function WGameWin(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //cover
    var coverX = 0;
    var coverY = 0;
    //text“Victory”
    var spriteTitleX = "scene_center_0";
    var spriteTitleY = "scene_center_-90";
    //button - to title
    var buttonBackMenuX = "spriteTitle_left_-30";
    var buttonBackMenuY = "spriteTitle_bottom_170";
    //button - restart
    var buttonReplayX = "spriteTitle_right_30";
    var buttonReplayY = "spriteTitle_bottom_170";
    //effect and animation
    var effectGameWinX = "spriteTitle_left_-140";
    var effectGameWinY = "spriteTitle_top_-98";
    var particleLeftX = 0;
    var particleLeftY = 0;
    var particleRightX = 0;
    var particleRightY = 0;

    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================

    //Return value
    var win = 0;
    //text"Victory"
    var spriteTitle = null;
    //clear time
    var clearTime = null;
    //"to title" button
    var buttonBackMenu = null;
    //"restart" button
    var buttonReplay = null;
    //cover
    var cover = null;
    //shortcut
    var shortcut = null;
    //effect
    var effectGameWin = null;
    
    var loadOver = false;
    //duration of effect
    var effectTime = 0;
    //particle
    var particleLeft = null;
    var particleRight = null;
    var resList = [
        "System/GameWin/text-title.png",
        "System/button-all_0.png",
        "System/button-all_1.png",
        "System/GameWin/effect-light.png",
        "System/GameWin/effect-grain_1.png",
        "System/GameWin/effect-grain_2.png"];
    //preload images
    RF.CacheUIRes(resList, init);
    //==================================== Private functions ===================================
    /**
     * preload function
     * @param hash
     */
    function init(hash) {
        cover = new ISprite(IVal.GWidth, IVal.GHeight, IColor.Black());
        cover.visible = false;
        cover.x = coverX;
        cover.y = coverY;
        cover.z = 1499;
         //sprite of "Victory"
        spriteTitle = new ISprite(hash[resList[0]]);
        spriteTitle.visible = false;
        spriteTitle.x = RF.PointTranslation(_sf , spriteTitle , spriteTitleX , "x");
        spriteTitle.y = RF.PointTranslation(_sf , spriteTitle , spriteTitleY , "y");
        spriteTitle.z = 1505;

        //clear time
        clearTime = new ISprite(400,200,IColor.Transparent());
        clearTime.x = (IVal.GWidth - clearTime.width) / 2;
        clearTime.y = spriteTitle.y + 40;
        clearTime.z = 2010;

        buttonBackMenu = new IButton(hash[resList[1]], hash[resList[2]],"To Title");
        buttonBackMenu.visible = false;
        buttonBackMenu.x = RF.PointTranslation(_sf , buttonBackMenu , buttonBackMenuX , "x");
        buttonBackMenu.y = RF.PointTranslation(_sf , buttonBackMenu , buttonBackMenuY , "y");
        buttonBackMenu.z = 1505;
 
        buttonReplay = new IButton(hash[resList[1]], hash[resList[2]],"Restart");
        buttonReplay.visible = false;
        buttonReplay.x = RF.PointTranslation(_sf , buttonReplay , buttonReplayX , "x");
        buttonReplay.y = RF.PointTranslation(_sf , buttonReplay , buttonReplayY , "y");
        buttonReplay.z = 1505;
 
        effectGameWin = new ISprite(hash[resList[3]]);
        effectGameWin.x = RF.PointTranslation(_sf , effectGameWin , effectGameWinX , "x");
        effectGameWin.y = RF.PointTranslation(_sf , effectGameWin , effectGameWinY , "y");
        effectGameWin.z = spriteTitle.z - 1;
        effectGameWin.visible = false;

        loadOver = true;
        //animation
        gameOverAnimation();
        if(IsPC()){
            shortcut = new WShortcut();
            shortcut.shortcutList(14)
        }
    }
    /**
     * animation
     */
    function gameOverAnimation(){
        spriteTitle.fade(0,1,80);
        buttonBackMenu.fade(0,1,30);
        buttonReplay.fade(0,1,30);
        effectGameWin.addAction(action.wait,120);

        cover.opacity = 0.7;
        spriteTitle.visible = true;
        buttonBackMenu.visible = true;
        buttonReplay.visible = true;
        cover.visible = true;
        effectGameWin.visible = true;

        particleLeft = new IParticle([RF.LoadBitmap(resList[4]),RF.LoadBitmap(resList[5])],20,50,0,null);
        particleLeft.z = spriteTitle.z - 1;
        //direction of particle
        particleLeft.dir = 2;
        //length of particle
        particleLeft.line = 150;
        //left particle
        particleLeft.rect = new IRect(spriteTitle.x + particleLeftX ,spriteTitle.y + particleLeftY + spriteTitle.height / 5,spriteTitle.x + particleLeftX + spriteTitle.width / 2,spriteTitle.y + particleLeftY + spriteTitle.height / 5 + spriteTitle.height / 3);
        particleRight = new IParticle([RF.LoadBitmap(resList[4]),RF.LoadBitmap(resList[5])],20,50,0,null);
        particleRight.z = spriteTitle.z - 1;
        //direction of particle
        particleRight.dir = 3;
        //length of particle
        particleRight.line = 150;
        //right particle
        particleRight.rect = new IRect(spriteTitle.x + particleRightX + spriteTitle.width / 2 ,spriteTitle.y + particleRightY+ spriteTitle.height / 5,spriteTitle.x + particleRightX + spriteTitle.width,spriteTitle.y + particleRightY + spriteTitle.height / 5 + spriteTitle.height / 3);

    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function () {
        if (!loadOver) return true;
        effectTime += 1;
        particleLeft.update();
        particleRight.update();

        if(effectTime >= 60){
            effectGameWin.fadeTo(1,60);
        }
        if(effectTime >= 120){
            effectGameWin.fadeTo(0.7,60);
            effectTime = 0
        }
        if (buttonBackMenu.update() || IInput.isKeyDown(RC.Key.cancel)) {//press "to title" button
            RV.GameSet.playEnterSE();
            _sf.dispose(0);
            return true;
        }
        if (buttonReplay.update() || IInput.isKeyDown(RC.Key.ok)) {//press "restart" button
            RV.GameSet.playEnterSE();
            _sf.dispose(1);
            return true;
        }
        return true;
    };
    /**
     * Dispose this interface
     */
    this.dispose = function (fail) {
        if (_sf.endDo != null) _sf.endDo(fail);

        IInput.keyCodeAry = [];
        spriteTitle.dispose();
        buttonReplay.dispose();
        buttonBackMenu.dispose();
        cover.dispose();
        if(shortcut != null) shortcut.dispose();
        effectGameWin.dispose();
        particleLeft.dispose();
        particleRight.dispose();
    };
}/**
 * Created by YewMoon on 2019/3/1.
 * Game interface·Inventory
 * @param shortcut | shortcut
 */
function WInventory(shortcut){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_-25";
    //title
    var titleX = 0;
    var titleY = 14;
    //"Stock"
    var textItemX = 68;
    var textItemY = 95;
    //"Inventory Slots"
    var textShortcutX = 68;
    var textShortcutY = 353;
    //Close button
    var buttonCloseX = "back_right_-50";
    var buttonCloseY = "back_top_14";
    //viewPort
    var vpX = "back_left_80";
    var vpY = "back_top_128";
    //item button
    var buttonItemX = 3;
    var buttonItemY = 1;
    //horizontal spacing
    var buttonItemGapX = 14;
    //vertical spacing
    var buttonItemGapY = 14;
    //Maximum per line
    var buttonMaxLine = 6;
    //offset of choose box，Relative coordinates of item Icon
    var boxChooseX = - 1;
    var boxChooseY = - 1;
    //number of slots
    var buttonNum = 4;
    //inventory slots
    var buttonShortcutX = "back_left_80";
    var buttonShortcutY = "back_bottom_-40";
    //spacing of slots
    var buttonShortcutGap = 20;
    //offset of slots' choose box
    var boxChooseShortcutX = -200;
    var boxChooseShortcutY = 1640;
    //Show details-Relative coordinates of back
    var baseDetailsX = "back_left_556";
    var baseDetailsY = "back_top_100";
    //Put/Unload button
    var buttonPutX = "baseDetails_center_-10";
    var buttonPutY = "baseDetails_top_260";
    //Use button
    var buttonUseX = "baseDetails_left_0";
    var buttonUseY = "buttonPut_bottom_42";
    //Remove button
    var buttonAbandonX = "buttonUse_right_82";
    var buttonAbandonY = "buttonPut_bottom_42";
    //Icon offset
    var iconX = 4;
    var iconY = 4;
    //number board，Relative coordinates of item Icon
    var boardNumX = 40;
    var boardNumY = 40;
    //Show details-item name,Relative coordinates of baseDetails
    var detailsNameX = 0;
    var detailsNameY = 0;
    //Show details-Description,Relative coordinates of baseDetails
    var detailsMsgX = 0;
    var detailsMsgY = 25;
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Back
    var back = null;
    //Close button
    var buttonClose = null;
    //viewport of stocks
    var vp = null;
    //item buttons array
    var buttonInventory = [];
    //inventory slots array
    var buttonShortcut = [];
    //Put button
    var buttonPut = null;
    //Use button
    var buttonUse = null;
    //Remove button
    var buttonAbandon = null;
    //board of Show details
    var baseDetails = null;
    //choose box
    var boxChoose = null;
    //slots' choose box
    var boxChooseShortcut = null;
    //resource list
    var resList = null;
    //Preload complete
    var loadOver = false;
    //items of current actor
    var itemData = RV.GameData.items;
    //temporary image
    var tempPic = null;
    //selection index
    var selectButtonIndex = 0;
    var selectShortcutIndex = -1;
    //Dialog window
    var dialog = null;
    //id of selected item
    var nowItem = 0;
    var resHash = null;
    resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/Inventory/back-main.png",
        "System/board-store.png",
        "System/Menu/Inventory/board-item-number.png",
        "System/choose-box.png",
        "System/Menu/button-function_0.png",
        "System/Menu/button-function_1.png",
        "System/Menu/button-function_2.png",
        "System/button-function_0.png",
        "System/button-function_1.png",
        "System/button-function_2.png",
    ];
    //Preload resource
    RF.CacheUIRes(resList,init);
    //==================================== Private functions ===================================
    /**
     * preload function
     * @param hash
     */
    function init (hash){
        resHash = hash;
        //set Back
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1500;
        drawTitle();
        //Close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]],"",vp);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1630;
        //set viewport
        vp = new IViewport(0,0,460,200);
        vp.x = RF.PointTranslation(_sf , vp , vpX , "x");
        vp.y = RF.PointTranslation(_sf , vp , vpY , "y");
        vp.z = 1620;
        vp.isAutoMove = true;
        vp.dir = IViewport.Dir.Vertical;
        //draw item buttons
        drawInventory(hash);
        //initialize choose box
        boxChoose = new ISprite(hash[resList[5]],vp);
        boxChoose.x = buttonInventory[0].x + boxChooseX;
        boxChoose.y = buttonInventory[0].y + boxChooseY;
        boxChoose.z = 1640;
        boxChooseShortcut = new ISprite(hash[resList[5]]);
        boxChooseShortcut.x = boxChooseShortcutX;
        boxChooseShortcut.z = boxChooseShortcutY;
        
        baseDetails = new ISprite(172,270,IColor.Transparent());
        baseDetails.x = RF.PointTranslation(_sf , baseDetails , baseDetailsX , "x");
        baseDetails.y = RF.PointTranslation(_sf , baseDetails , baseDetailsY , "y");
        baseDetails.z = 1620;
        
        buttonPut = new IButton(hash[resList[9]], hash[resList[10]]," ",null,true);
        buttonPut.x = RF.PointTranslation(_sf , buttonPut , buttonPutX , "x");
        buttonPut.y = RF.PointTranslation(_sf , buttonPut , buttonPutY , "y");
        buttonPut.z = 1630;
        buttonPut.setEnableBitmap(hash[resList[11]]);
        buttonPut.setEnable(itemData.length > 0);
        buttonPut.tag = 0;
        buttonPut.drawTitleQ("Put",RV.setColor.wBase,14);
        
        buttonUse = new IButton(hash[resList[6]], hash[resList[7]]," ",null,true);
        buttonUse.x = RF.PointTranslation(_sf , buttonUse , buttonUseX , "x");
        buttonUse.y = RF.PointTranslation(_sf , buttonUse , buttonUseY , "y");
        buttonUse.z = 1630;
        buttonUse.setEnableBitmap(hash[resList[8]]);
        buttonUse.setEnable(itemData.length > 0);
        buttonUse.drawTitleQ("Use",RV.setColor.wBase,14);
        
        buttonAbandon = new IButton(hash[resList[6]], hash[resList[7]]," ");
        buttonAbandon.x = RF.PointTranslation(_sf , buttonAbandon , buttonAbandonX , "x");
        buttonAbandon.y = RF.PointTranslation(_sf , buttonAbandon , buttonAbandonY , "y");
        buttonAbandon.z = 1630;
        buttonAbandon.setEnableBitmap(hash[resList[8]]);
        buttonAbandon.setEnable(itemData.length > 0);
        showDetails(buttonInventory[0].tag);
        buttonAbandon.drawTitleQ("Remove",RV.setColor.wBase,13);
        loadOver = true;
    }
    /**
     * Draw Title and text
     */
    function drawTitle(){
        var title = "Inventory"
        back.drawTextQ(title,(back.width - IFont.getWidth(title,30)) / 2 + titleX,titleY,RV.setColor.wBase,30);
        back.drawTextQ("Stock",textItemX,textItemY,RV.setColor.wBase,16);
        back.drawTextQ("Inventory Slots",textShortcutX,textShortcutY,RV.setColor.wBase,16);
    }
    /**
     * draw item button of stock
     * @param hash
     */
    function drawInventory(hash){
        for(var i = itemData.length - 1; i>=0; i--){
            if(itemData[i].num <= 0){
                itemData.splice(i,1);
                i = itemData.length
            }
        }
        var buttonLength = itemData.length;
        if(buttonLength <= 0){
            buttonLength = buttonMaxLine * 3;
        }
        for(i = 0;i< buttonLength ;i++){
            var button = initInventoryButton(hash ,
                i >= itemData.length ? 0 : itemData[i], vp);
            button.x = (i % buttonMaxLine) *(button.width + buttonItemGapX) + buttonItemX;
            button.y = parseInt(i / buttonMaxLine) *(button.height + buttonItemGapY) + buttonItemY;
            button.z = 1630;
            buttonInventory.push(button);
            if(itemData.length > 0 && baseDetails != null) showDetails(itemData[i])
        }
        //draw inventory slots
        for(i = 0; i< buttonNum; i++){
            if(RV.GameData.userItem[i].num <= 0){
                RV.GameData.userItem[i] = 0
            }
            button = initInventoryButton(hash ,RV.GameData.userItem[i],0,null);
            button.x = RF.PointTranslation(_sf , button , buttonShortcutX , "x") + i * (button.width + buttonShortcutGap);
            button.y = RF.PointTranslation(_sf , button , buttonShortcutY , "y");
            button.z = 1630;
            buttonShortcut.push(button);
        }
        if(boxChooseShortcut != null && itemData.length != 0) updateChoose(0,buttonShortcut)
    }
    /**
     * initialize item button
     * @param hash 
     * @param item | item data
     * @param viewPort | viewport of stock
     */
    function initInventoryButton(hash , item , viewPort){
        var tempButton = new IButton(hash[resList[3]], hash[resList[3]],"",viewPort , true);
        //Set image of button disable status
        tempButton.setEnableBitmap(hash[resList[3]]);
        if(item.id >= 0 || item >= 0){
            drawItemButton(hash,tempButton,item);
        }
        tempButton.tag = item;
        return tempButton;
    }
    /**
     * draw item icon
     * @param hash
     * @param button | item button
     * @param item | item data
     */
    function drawItemButton(hash,button,item){
        if(item.id >= 0 || item >= 0){
            var tempPic = button.getSprite();
            tempPic.clearBitmap();
            if(item != 0) var cof = item.findData();
            var opacity = 1.0;
            //weapon or armor
            if(item.type != 0) opacity = 0.5;
            tempPic.opacity = opacity;
            if(cof != null) {
                tempPic.drawBitmap(RF.LoadCache("Icon/" + cof.icon),iconX,iconY,false);
                var tempPicNumBack = hash[resList[4]];
                tempPic.drawBitmap(tempPicNumBack,boardNumX,boardNumY,false);
                tempPic.drawTextQ(item.num,boardNumX + (tempPicNumBack.width - IFont.getWidth(item.num,10)) / 2,boardNumY + (tempPicNumBack.height - IFont.getHeight(item.num,10)) / 2,RV.setColor.num,10);
            }
        }
        button.tag = item;
    }
    /**
     * Drag item
     */
    function dropItem(){
        //Drag end
        if(IInput.up && tempPic != null){
            IInput.dx = 0;
            IInput.dy = 0;
            for(var i = 0;i < buttonNum; i++){
                if(buttonShortcut[i].isOn() && tempPic){//if touch slots
                    if(tempPic.tag.type == 0){
                        fillInShortcut(i,tempPic.tag);
                        updateChoose(i,buttonShortcut);
                        showDetails(tempPic.tag);
                    }
                }
            }
            if(tempPic != null) {
                tempPic.disposeMin();
                tempPic = null;
            }
            return;
        }
        if(dropShortcut()) return;
        dropMain();
    }
    /**
     * drag item of stock
     */
    function dropMain(){
        for(var i = 0;i<buttonInventory.length;i++) {
            if(buttonInventory[i].update()){
                RV.GameSet.playEnterSE();
                switchButton(0);
                updateChoose(i,buttonInventory);
                showDetails(buttonInventory[i].tag);
                return true;
            }
            if (buttonInventory[i].isOn()) {
                if(IInput.move && buttonInventory[i].tag.type == 0){
                    newTempButton(i,0,buttonInventory[i].tag);
                    tempButtonMove();
                    return true
                }
                return true
            }
        }
    }
    /**
     * drag item of slots
     */
    function dropShortcut(){
        for(var i = 0;i < buttonNum;i++){
            if (buttonShortcut[i].update() && buttonShortcut[i].tag.id > 0) {
                RV.GameSet.playEnterSE();
                switchButton(1);
                updateChoose( i , buttonShortcut);
                if(buttonShortcut[i].tag.id != null && RV.GameData.userItem[i].id != 0) showDetails(buttonShortcut[i].tag);
                return true
            }
            if(buttonShortcut[i].isOn() && IInput.move){
                newTempButton(i,1,buttonShortcut[i].tag);
                tempButtonMove();
                return true
            }
        }
        return false;
    }
    /**
     * Unload from slots
     * @param index |  index of slots
     */
    function cancelItem(index){
        RV.GameSet.playEquipSE();
        drawItemButton(resHash,buttonShortcut[index],0);
        buttonShortcut[index].setEnable(true);
        RV.GameData.userItem[index] = 0;
    }
    /**
     * Put item in the slot
     * @param index |  index of slots
     * @param item |  item data
     */
    function fillInShortcut(index,item){
        for(var i = 0; i< buttonNum; i++){
            if(buttonShortcut[i].tag.id == item.id){
                cancelItem(i);
            }
        }
        RV.GameSet.playEquipSE();
        drawItemButton(resHash,buttonShortcut[index],item);
        buttonShortcut[index].setEnable(true);
        switchButton(1);
        RV.GameData.userItem[index] = item;
    }
    /**
     * Draw a temporary button for drag
     * @param index | index of item button
     * @param buttonType | button type 0button of stock 1slot
     * @param tag |  item data
     */
    function newTempButton(index,buttonType,tag){
        if(tag.id <= 0 || tag <= 0) return;
        if(tempPic == null){
            var cof = tag.findData();
            if(buttonType == 0){
                tempPic = new ISprite(RF.LoadCache("Icon/" +cof.icon));
                tempPic.x = vp.x + vp.ox + buttonInventory[index].x + boxChooseX;
                tempPic.y = vp.y + vp.oy + buttonInventory[index].y + boxChooseY;
                selectButtonIndex = index;
            }else if(buttonType == 1){
                tempPic = new ISprite(RF.LoadCache("Icon/" +cof.icon));
                tempPic.x = buttonShortcut[index].x + boxChooseX;
                tempPic.y = buttonShortcut[index].y + boxChooseY;
            }
            tempPic.z = 1635;
            tempPic.opacity = 0.6;
            tempPic.tag = tag;
        }
    }
    /**
     * move of tempbutton
     */
    function tempButtonMove(){
        if(IInput.dx == 0 || IInput.dy == 0){
            IInput.dx = IInput.x;
            IInput.dy = IInput.y;
        }
        if(tempPic != null) tempPic.x += IInput.x - IInput.dx;
        if(tempPic != null) tempPic.y += IInput.y - IInput.dy;
        IInput.dx = IInput.x;
        IInput.dy = IInput.y;
    }
    /**
     * update choose box
     * @param index | index of item button
     * @param button | button type: buttonInventory-button of stock, buttonShortcut-slot
     */
    function updateChoose(index,button){
        if(index != selectButtonIndex || index != selectShortcutIndex){
            RV.GameSet.playSelectSE();
        }
        if(button[index].tag.id > 0){
            if(button == buttonShortcut){
                boxChooseShortcut.x = button[index].x + boxChooseX;
                boxChooseShortcut.y = button[index].y + boxChooseY;
                boxChooseShortcut.visible = true;
                boxChoose.visible = false;
                selectShortcutIndex = index;
            }else{
                boxChoose.x = button[index].x + boxChooseX;
                boxChoose.y = button[index].y + boxChooseY;
                boxChoose.visible = true;
                boxChooseShortcut.visible = false;
                selectButtonIndex = index;
                selectShortcutIndex = -1;
            }
        }
    }
    /**
     * change the function of button
     * @param index | 0put 1Unload
     */
    function switchButton(index){
        if(index == 0){
            buttonPut.drawTitleQ("Put",RV.setColor.wBase,14);
            buttonPut.tag = 0;
        }else{
            buttonPut.drawTitleQ("Unload",RV.setColor.wBase,14);
            buttonPut.tag = 1;
        }
        updateEnable();
    }
    /**
     * logic of Put and Unload button
     * @param index | index of slots
     */
    function updatePutButton(index){
        if(buttonPut.tag == 0){//Put button
            if(shortcut != null) shortcut.shortcutList(10);
            dialog = new WInventorySelect();
            dialog.endDo = function(e){
                dialog = null;
                if(e != null){
                    fillInShortcut(e,nowItem);
                    updateChoose(e,buttonShortcut);
                    switchButton(1);
                }
                if(shortcut != null) shortcut.shortcutList(3);
            };
        }else{//Unload button
            cancelItem(index);
            boxChooseShortcut.visible = false;
            updateChoose(0,buttonInventory);
            showDetails(buttonInventory[0].tag);
            switchButton(0);
        }
    }
    /**
     * logic of Use/Remove
     * @param num | Number of items used
     * @param type | type 0：Use，1：Remove
     */
    function updateUseButton(num,type){
        var nowIndex = -1;
        if(type == 0){
            RV.GameData.useItem(nowItem.id,num);
        }else{
            RV.GameData.discardItem(nowItem, num);
        }
        if(nowItem.num <= 0){
            for(var i = 0;i < buttonInventory.length;i++){
                if(buttonInventory[i].tag == nowItem){
                    nowIndex = i;
                }
                buttonInventory[i].disposeMin();
                buttonInventory[i] = null;
            }
            buttonInventory = [];
            for(i = 0; i <buttonNum ; i++){
                if(buttonShortcut[i].tag.id == nowItem.id){
                    RV.GameData.userItem[i] = 0;
                }
                buttonShortcut[i].disposeMin();
                buttonShortcut[i] = null;
            }
            buttonShortcut = [];
            drawInventory(resHash);
            updateEnable();
            if(selectButtonIndex > 0){
                boxChooseShortcut.visible = false;
                boxChoose.visible = true;
                if(nowIndex >= 1){
                    updateChoose(nowIndex - 1,buttonInventory);
                    showDetails(buttonInventory[nowIndex - 1].tag);
                }
            }else if(itemData.length != 0){
                updateChoose(0,buttonInventory);
                showDetails(itemData[0])
            }
            if(itemData.length == 0) baseDetails.clearBitmap();
        }else{
            var item = null;
            for(i = 0;i<buttonInventory.length;i++){
                if(buttonInventory[i].tag == nowItem){
                    item = buttonInventory[i].tag;
                    nowIndex = i;
                }
            }
            for(i = 0; i < buttonNum ; i++){
                if(item == buttonShortcut[i].tag){
                    drawItemButton(resHash,buttonShortcut[i],nowItem);
                }
            }
            drawItemButton(resHash,buttonInventory[nowIndex],nowItem);
        }
    }
    /**
     * open window of "Use Items" 
     * @param type | type 0：Use，1：Remove
     */
    function chooseNum(type){
        if(nowItem.num > 1){
            if(shortcut != null) shortcut.shortcutList(11);
            dialog = new WInventoryNumControl(nowItem.num);
            dialog.endDo = function(e){
                dialog = null;
                if(e != null){
                    updateUseButton(e,type);
                }
                if(shortcut != null) shortcut.shortcutList(3);
            };
        }else{
            updateUseButton(1,type);
        }
    }
    /**
     * draw details of item
     * @param tag |  item data
     */
    function showDetails(tag){
        if(tag.id > 0){
            baseDetails.clearBitmap();
            var cof = tag.findData();
            baseDetails.drawTextQ(cof.name,detailsNameX,detailsNameY,RV.setColor.wBase,16);
            baseDetails.drawText("\\s[14]" + cof.msg,detailsMsgX,detailsMsgY,0,RV.setColor.wBase,true,148);
            nowItem = tag;
            updateEnable();
            return;
        }
        nowItem = 0;
    }
    /**
     * check available status of button
     */
    function updateEnable(){
        if(itemData.length == 0) buttonAbandon.setEnable(false);
        if(nowItem.type != 0 || itemData.length == 0){
            buttonPut.setEnable(false);
            buttonUse.setEnable(false)
        }else if(nowItem.findData().userType == 1){
            buttonPut.setEnable(true);
            buttonUse.setEnable(true)
        }else{
            buttonPut.setEnable(true);
            buttonUse.setEnable(false)
        }
    }
    /**
     * update PC key selection
     */
    function updatePCKey(){
        if(boxChoose != null){
            //down
            if(IInput.isKeyDown(RC.Key.down)){
                keySelectMain(buttonMaxLine,2);
                return true;
            }
            //up
            if(IInput.isKeyDown(RC.Key.up)){
                keySelectMain(-buttonMaxLine,1);
                return true;
            }
            //right
            if(IInput.isKeyDown(RC.Key.right)){
                if(boxChoose.visible){
                    keySelectMain(1,0);
                }else{
                    keySelectShortcut(1);
                }
                return true;
            }
            //left
            if(IInput.isKeyDown(RC.Key.left)){
                if(boxChoose.visible){
                    keySelectMain(-1,0);
                }else{
                    keySelectShortcut(-1);
                }
                return true;
            }
        }
    }
    /**
     * update PC key selection of stock
     * @param add | slots number that the choose box move
     * @param isUpDown | type 1up 2down
     */
    function keySelectMain(add,isUpDown){
        var index = selectButtonIndex + add;
        if(isUpDown == 1){ // Up
            if(index < 0) index = 0;
            if(selectShortcutIndex >= 0){
                index -= add;
            }
            selectShortcutIndex = -1;
            switchButton(0);
        }else if(isUpDown == 2){ // Down
            if(index >= buttonInventory.length || !buttonInventory[index].getEnable()){
                var temp = -1;
                for(var i = 0;i<buttonShortcut.length;i++){
                    if(buttonShortcut[i].tag.id > 0){
                        temp = i;
                        break;
                    }
                }
                if(temp > -1){
                    selectShortcutIndex = temp;
                    switchButton(1);
                    updateChoose(temp,buttonShortcut);
                    showDetails(buttonShortcut[temp].tag);
                }
            }
        }
        index = Math.min(buttonInventory.length - 1,index);
        index = Math.max(0,index);
        if(selectShortcutIndex < 0){
            updateChoose(index,buttonInventory);
            showDetails(buttonInventory[index].tag);
            if(boxChoose.y >= 2 *(buttonItemGapY + boxChoose.height + boxChooseY)) vp.oy = - (boxChoose.y - 2 *(boxChoose.height + buttonItemGapY) + buttonItemGapY / 3 - buttonItemY);
            if(boxChoose.y <= buttonItemY) vp.oy = - boxChoose.y;
            selectButtonIndex = index;
        }
    }
    /**
     * update PC key selection of slots
     * @param add | slots number that the choose box move
     */
    function keySelectShortcut(add){
        var index = selectShortcutIndex + add;
        if(index < buttonNum && index >= 0 && buttonShortcut[index].tag <= 0){
            if(add >= 0){
                keySelectShortcut(add + 1);
            }else{
                keySelectShortcut(add - 1);
            }
        }else if(index < buttonNum && index >= 0){
            showDetails(buttonShortcut[index].tag);
            updateChoose(index,buttonShortcut);
            selectShortcutIndex = index;
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if (dialog != null && dialog.update()) return true;
        if(tempPic == null && vp.updateMove()) return true;
        if(tempPic != null && tempButtonMove()) return true;
        if(updatePCKey()) return true;
        dropItem();
        if(buttonUse.update() || (IInput.isKeyDown(RC.Key.ok) && tempPic == null)){//Press use button
            if(!buttonUse.getEnable()) return true;
            RV.GameSet.playEnterSE();
            chooseNum(0);
            return true
        }
        if(buttonAbandon.update() || (IInput.isKeyDown(RC.Key.run) && tempPic == null)){//press Remove button
            RV.GameSet.playEnterSE();
            chooseNum(1);
            return true
        }
        if(buttonPut.update() || (IInput.isKeyDown(RC.Key.jump) && tempPic == null)){//press put button
            if(!buttonPut.getEnable()) return true;
            RV.GameSet.playEnterSE();
            updatePutButton(selectShortcutIndex);
            return true
        }
        if(buttonClose.update() || (IInput.isKeyDown(RC.Key.cancel) && tempPic == null)){//press Close button
            RV.GameSet.playCancelSE();
            _sf.dispose();
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(item){
        if (_sf.endDo != null) _sf.endDo(item);
        back.dispose();
        buttonUse.dispose();
        buttonAbandon.dispose();
        buttonPut.dispose();
        baseDetails.dispose();
        buttonClose.dispose();
        for(var i = 0;i < buttonInventory.length;i++){
            buttonInventory[i].dispose();
        }
        vp.dispose();
        boxChoose.dispose();
        boxChooseShortcut.dispose();
        for(i = 0; i < buttonNum; i++){
            buttonShortcut[i].dispose()
        }
    }
}


/**
 * Created by YewMoon on 2019/3/26.
 * Game interface·Inventory·Use Items(adjust number)
 * @param maxNum | Max number of the item
 */
function WInventoryNumControl(maxNum){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //back
    var backX = "scene_center_0";
    var backY = "scene_center_0";
    //Close button
    var buttonCloseX = "back_right_-30";
    var buttonCloseY = "back_top_12";
    //bar of slider
    var barNumX = "back_center_0";
    var barNumY = "back_center_0";
    //slider
    var buttonAdjustX = "barNum_left_0";
    var buttonAdjustY = "back_center_0";
    //Confirm button
    var buttonSureX = "back_left_50";
    var buttonSureY = "back_bottom_-20";
    //Max button
    var buttonAllX = "back_right_-50";
    var buttonAllY = "back_bottom_-20";
    //plus button
    var buttonPlusX = "back_right_-40";
    var buttonPlusY = "back_center_0";
    //minus button
    var buttonMinusX = "back_left_40";
    var buttonMinusY = "back_center_0";
    //sprite to show the number
    var showNumX = "back_left_88";
    var showNumY = "back_top_136";
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //current number
    var num = 1;
    //Back
    var back = null;
    //Close button
    var buttonClose = null;
    //bar of slider
    var barNum = null;
    //confirm button
    var buttonSure = null;
    //Max button
    var buttonAll = null;
    //slider
    var buttonAdjust = null;
    //plus button
    var buttonPlus = null;
    //minus button
    var buttonMinus = null;
    //sprite to show the number
    var showNum = null;
    //unit number
    var unit = null;
    //wait time of plus button
    var waitTime = 0;
    //Preload complete
    var loadOver = false;
    //List of resources required in this interface
    var resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/back-point.png",
        "System/Menu/Inventory/bar-num.png",
        "System/Menu/Inventory/button-num_0.png",
        "System/Menu/Inventory/button-num_1.png",
        "System/button-all_0.png",
        "System/button-all_1.png",
        "System/button-plus_0.png",
        "System/button-plus_1.png",
        "System/button-plus_2.png",
        "System/button-minus_0.png",
        "System/button-minus_1.png",
        "System/button-minus_2.png"

    ];
    //Preload resource
    RF.CacheUIRes(resList,init);
    //==================================== Private functions ===================================
    /**
     * preload function
     * @param hash
     */
    function init(hash){
        
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1680;
        //Draw Title
        back.drawTextQ("Use Items",(back.width - IFont.getWidth("Use Items",30)) / 2,12,RV.setColor.wBase,30);
        
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1690;
        
        barNum = new ISprite(hash[resList[3]]);
        barNum.x = RF.PointTranslation(_sf , barNum , barNumX , "x");
        barNum.y = RF.PointTranslation(_sf , barNum , barNumY , "y");
        barNum.z = 1690;
        
        showNum = new ISprite(200,20,IColor.Transparent());
        showNum.x = RF.PointTranslation(_sf , showNum , showNumX , "x");
        showNum.y = RF.PointTranslation(_sf , showNum , showNumY , "y");
        showNum.z = back.z + 10;
        drawNum();
        
        buttonAdjust = new IButton(hash[resList[4]],hash[resList[5]]);
        buttonAdjust.x = RF.PointTranslation(_sf , buttonAdjust , buttonAdjustX , "x");
        buttonAdjust.y = RF.PointTranslation(_sf , buttonAdjust , buttonAdjustY , "y");
        buttonAdjust.z = 1700;
        unit = maxNum / (barNum.width - buttonAdjust.width);
        
        buttonPlus = new IButton(hash[resList[8]],hash[resList[9]]);
        buttonPlus.x = RF.PointTranslation(_sf , buttonPlus , buttonPlusX , "x");
        buttonPlus.y = RF.PointTranslation(_sf , buttonPlus , buttonPlusY , "y");
        buttonPlus.z = 1700;
        buttonPlus.setEnableBitmap(hash[resList[10]]);
        
        buttonMinus = new IButton(hash[resList[11]],hash[resList[12]]);
        buttonMinus.x = RF.PointTranslation(_sf , buttonMinus , buttonMinusX , "x");
        buttonMinus.y = RF.PointTranslation(_sf , buttonMinus , buttonMinusY , "y");
        buttonMinus.z = 1700;
        buttonMinus.setEnableBitmap(hash[resList[13]]);
        buttonMinus.setEnable(false);
        
        buttonSure = new IButton(hash[resList[6]],hash[resList[7]]," ");
        buttonSure.x = RF.PointTranslation(_sf , buttonSure , buttonSureX , "x");
        buttonSure.y = RF.PointTranslation(_sf , buttonSure , buttonSureY , "y");
        buttonSure.z = 1700;
        buttonSure.drawTitleQ("Confirm",RV.setColor.wBase,14);
        
        buttonAll = new IButton(hash[resList[6]],hash[resList[7]]," ");
        buttonAll.x = RF.PointTranslation(_sf , buttonAll , buttonAllX , "x");
        buttonAll.y = RF.PointTranslation(_sf , buttonAll , buttonAllY , "y");
        buttonAll.z = 1700;
        buttonAll.drawTitleQ("Max",RV.setColor.wBase,14);
        loadOver = true
    }
    /**
     * draw number
     */
    function drawNum(){
        showNum.clearBitmap();
        showNum.drawTextQ("Number：" + num,0,0,RV.setColor.wBase,16);
    }
    /**
     * update number
     */
    function updateNum(){
        var moveUnit = (buttonAdjust.x - barNum.x) * unit;
        if(moveUnit >= 0){
            num = Math.ceil(moveUnit);
        }
        if(moveUnit < 0.5){
            num = 1
        }
        drawNum();
    }
    /**
     * check available status of button
     */
    function updateEnable(){
        buttonPlus.setEnable(true);
        buttonMinus.setEnable(true);
        if(num == maxNum){
            buttonPlus.setEnable(false);
        }
        if(num <= 1){
            buttonMinus.setEnable(false);
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if(buttonClose.update() || IInput.isKeyDown(RC.Key.cancel)){//press close button
            RV.GameSet.playCancelSE();
            _sf.dispose();
            return true
        }
        if(buttonSure.update() || IInput.isKeyDown(RC.Key.ok)){//press confirm button
            RV.GameSet.playEnterSE();
            _sf.dispose(num);
            return true
        }
        if(buttonAll.update() || IInput.isKeyDown(RC.Key.atk)){//press buttonAll
            RV.GameSet.playEnterSE();
            num = maxNum;
            updateEnable();
            drawNum();
            buttonAdjust.x = barNum.x + barNum.width - buttonAdjust.width;
            return true
        }
        //Drag slider
        if(buttonAdjust.getBack().GetRect().intersects(IInput.x,IInput.y,IInput.x + 1,IInput.y)&& IInput.down || barNum.GetRect().intersects(IInput.x,IInput.y,IInput.x + 1,IInput.y) && IInput.down){
            if(IInput.x <= barNum.x + barNum.width - buttonAdjust.width && IInput.x >= barNum.x) buttonAdjust.x = IInput.x;
            updateNum();
            updateEnable();
            return true
        }
        //press plus button
        if(waitTime >= 15 || buttonPlus.update()){
            RV.GameSet.playEnterSE();
            if(num < maxNum){
                num += 1;
                drawNum();
                buttonAdjust.x += (barNum.width - buttonAdjust.width) / (maxNum - 1);
                if(buttonAdjust.x < barNum.x) buttonAdjust.x = barNum.x;
                if(buttonAdjust.x > barNum.x + barNum.width - buttonAdjust.width) buttonAdjust.x = barNum.x + barNum.width - buttonAdjust.width;
            }
            waitTime = 0;
            updateEnable();
            return true
        }
        //press minus button
        if(waitTime <= - 15 || buttonMinus.update()){
            RV.GameSet.playEnterSE();
            if(num > 1){
                num -= 1;
                drawNum();
                buttonAdjust.x -= (barNum.width - buttonAdjust.width) / (maxNum - 1);
                if(buttonAdjust.x < barNum.x) buttonAdjust.x = barNum.x;
                if(buttonAdjust.x > barNum.x + barNum.width - buttonAdjust.width) buttonAdjust.x = barNum.x + barNum.width - buttonAdjust.width;
            }
            waitTime = 0;
            updateEnable();
            return true
        }
        if(buttonPlus.getBack().isSelectTouch() && IInput.down|| IInput.isKeyPress(RC.Key.right)){//keep press plus button
            waitTime += 1;
            return true
        }
        if(buttonMinus.getBack().isSelectTouch() && IInput.down || IInput.isKeyPress(RC.Key.left)){//keep press minus button
            waitTime -= 1;
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(num){
        if(_sf.endDo != null) _sf.endDo(num);
        buttonAdjust.dispose();
        back.dispose();
        barNum.dispose();
        buttonAll.dispose();
        buttonClose.dispose();
        buttonSure.dispose();
        buttonMinus.dispose();
        buttonPlus.dispose();
        showNum.dispose();
    };
}/**
 * Created by YewMoon on 2019/3/17.
 * Game interface·Inventory·choose slot
 */
function WInventorySelect(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_0";
    //Coordinates of  close button
    var buttonCloseX = "back_right_-30";
    var buttonCloseY = "back_top_12";
    //Coordinates of title,Relative coordinates of back
    var textTitleX = 0;
    var textTitleY = 12;
    //number of slots
    var buttonNum = 4;
    //Coordinates of slots
    var buttonX = "back_left_86";
    var buttonY = "back_top_110";
    //Button spacing
    var buttonGap = 22;
    //Icon offset
    var iconX = 4;
    var iconY = 4;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Back board
    var back = null;
    //Close button
    var buttonClose = null;
    //Choose Slots
    var buttonColumn = [];
    //Preload complete
    var loadOver = false;
    //List of resources required in this interface
    var resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/back-point.png",
        "System/board-store.png"
    ];
    //Preload images
    RF.CacheUIRes(resList,init);
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        //Back board
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1680;
        //Close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1690;
        //Draw Title
        back.drawTextQ("Choose Slot",(back.width - IFont.getWidth("Choose Slot",30)) / 2 + textTitleX,textTitleY,RV.setColor.wBase,30);
        //draw slots
        for(var i = 0; i < buttonNum; i++){
            var tempButton = new IButton(hash[resList[3]], hash[resList[3]],"",null,true);
            tempButton.x = RF.PointTranslation(_sf , tempButton , buttonX , "x") + i * (tempButton.width + buttonGap);
            tempButton.y = RF.PointTranslation(_sf , tempButton , buttonY , "y");
            tempButton.z = 1690;
            var tempSprite = tempButton.getSprite();
            //draw items
            if( RV.GameData.userItem[i] != 0 && RV.GameData.userItem[i].id != 0){
                tempSprite.drawBitmap(RF.LoadCache("Icon/" +RV.NowSet.findItemId(RV.GameData.userItem[i].id).icon),iconX,iconY,false);
            }
            buttonColumn[i] = tempButton;
        }

        loadOver = true
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        for(var i = 0; i < buttonNum; i++){
            if(buttonColumn[i].update()){
                RV.GameSet.playEnterSE();
                _sf.dispose(i);
                return true
            }
        }
        //press Item1-4
        if(IInput.isKeyDown(RC.Key.item1)){
            RV.GameSet.playEnterSE();
            _sf.dispose(0);
            return true
        }
        if(IInput.isKeyDown(RC.Key.item2)){
            RV.GameSet.playEnterSE();
            _sf.dispose(1);
            return true
        }
        if(IInput.isKeyDown(RC.Key.item3)){
            RV.GameSet.playEnterSE();
            _sf.dispose(2);
            return true
        }
        if(IInput.isKeyDown(RC.Key.item4)){
            RV.GameSet.playEnterSE();
            _sf.dispose(3);
            return true
        }
        if(buttonClose.update() || IInput.isKeyDown(RC.Key.cancel)){//press close button
            RV.GameSet.playCancelSE();
            _sf.dispose();
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(select){
        if (_sf.endDo != null) _sf.endDo(select);
        back.dispose();
        buttonClose.dispose();
        for(var i = 0; i < buttonNum; i++){
            buttonColumn[i].dispose()
        }
    }
}/**
 * Created by YewMoon on 2019/2/19.
 * Game interface·Menu
 */
function WMenu(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of black mask
    var coverX = 0;
    var coverY = 0;
    //Coordinates of back
    var backX = 0;
    var backY = "scene_center_0";
    //Coordinates of choose box
    var chooseBoxX = 0;
    var chooseBoxY = "back_top_30";
    //buttons of menu
    var buttonX = 0;
    var buttonY = "back_top_30";
    //Button spacing
    var buttonGap = 12;
    //back board of key Info
    var backKeyX = "scene_right_-20";
    var backKeyY = 0;
    if(IsPC()){
        backKeyY = "scene_bottom_-45";
    }else{
        backKeyY = "scene_bottom_-20";
    }
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Return value
    var menu = 0;
    //Back board
    var back = null;
    //Back cover
    var cover = null;
    //Show shortcut tips
    var shortcut = null;
    //menu button
    var menuButton = [];
    //Choose Box 
    var chooseBox = null;
    //selection index
    var selectIndex = 0;
    //Preload complete
    var loadOver = false;
    //Dialog window
    var dialog = null;
    //back board of key Info
    var backKey = null;

    //List of resources required in this interface
    var resList = [
        "System/Menu/back-main.png",
        "System/Menu/choose_box.png",
        "System/Menu/button-menu_0.png",
        "System/Menu/button-menu_1.png",
        "System/Menu/back-phone.png",
        "System/Menu/back-key.png"];

    //Preload resource
    RF.CacheUIRes(resList,init);
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        //cover
        cover = new ISprite(IVal.GWidth,IVal.GHeight,IColor.Black());
        cover.x = coverX;
        cover.y = coverY;
        cover.z = 1150;
        cover.opacity = 0.7;
        //Back
        back = new ISprite(hash[resList[0]]);
        back.x = backX;
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1160;
        back.opacity = 0;
        //new chooseBox
        if(IsPC()){
            chooseBox = new ISprite(hash[resList[1]].width,hash[resList[1]].height,IColor.Transparent());
            chooseBox.x = chooseBoxX;
            chooseBox.y = RF.PointTranslation(_sf , chooseBox , chooseBoxY , "y");
            chooseBox.z = 1200;
            chooseBox.drawBitmap(hash[resList[1]],0,0,false);
            chooseBox.opacity = 0;
        }
        //new buttons
        var textOfButton = ["Resume","Equipment","Skills","Inventory","Options","Load Game","Return to Title"]
        for(var i = 0; i < 7; i++){
            var tempButton = new IButton(hash[resList[2]],hash[resList[3]],"",null,true);
            tempButton.x = buttonX;
            tempButton.y = RF.PointTranslation(_sf , tempButton , buttonY , "y") + i * (tempButton.height + buttonGap);
            tempButton.z = 1170;
            tempButton.opacity = 0;
            //draw text of the button
            var tempSprite = tempButton.getSprite();
            tempSprite.drawTextQ(textOfButton[i],(tempSprite.width - IFont.getWidth(textOfButton[i],14)) / 2.5,(tempSprite.height - IFont.getHeight(textOfButton[i],14)) / 2,RV.setColor.wBase,14);
             menuButton[i] = tempButton;
        }
        if(IsPC()){
            shortcut = new WShortcut();
        }
        showKey(hash);
        loadOver = true;
        showMenu()
    }
    /**
     * Selection of PC button
     */
    function updatePCKey(){
        if(chooseBox != null){
            var tempSelectIndex = -1;
            //Press down button
            if(IInput.isKeyDown(RC.Key.down)){
                tempSelectIndex = selectIndex + 1;
                if(tempSelectIndex > menuButton.length - 1) tempSelectIndex = 0;
                updateBlock(tempSelectIndex);
                return true;
            }
            //Press up button
            if(IInput.isKeyDown(RC.Key.up)){
                tempSelectIndex = selectIndex - 1;
                if(tempSelectIndex < 0) tempSelectIndex = menuButton.length - 1;
                updateBlock(tempSelectIndex);
                return true;
            }
            //Press ok button
            if(IInput.isKeyDown(RC.Key.ok)){
                RV.GameSet.playEnterSE();
                menuButton[selectIndex].update();
                updateButton(selectIndex);
                return true;
            }
            //Press cancel button
            if(IInput.isKeyDown(RC.Key.cancel)){
                RV.GameSet.playCancelSE();
                _sf.dispose();
                return true
            }
        }
    }
    /**
     * Update position of chooseBox
     * @param index 0:“resume” ,1:“Equipment”,2:“skills”,3:“inventory”,4:“options”,5:“Load Game”,6:“Return to title”
     */
    function updateBlock(index){
        if(chooseBox == null) return;
        if(index != selectIndex){
            chooseBox.y = menuButton[index].y;
            selectIndex = index;
            RV.GameSet.playSelectSE();
        }

    }
    /**
     * Execute logic after buttons are pressed
     * @param index 0:“resume” ,1:“Equipment”,2:“skills”,3:“inventory”,4:“options”,5:“Load Game”,6:“Return to title”
     */
    function updateButton(index){
        if(RV.NowMap.getActor().combatTime > 0 && (index == 1 || index == 2 || index == 3)){
            RF.ShowTips("Please disengagement！");
            return true;
        }
        if(shortcut != null) shortcut.shortcutList(index);
        hideMenu();
        if(index == 0){
            _sf.dispose();
            return false
        }else if(index == 1){
            dialog = new WEquipment(shortcut);
        }else if(index == 2){
            dialog = new WSkill(shortcut);
        }else if(index == 3){
            dialog = new WInventory(shortcut);
        }else if(index == 4){
            dialog = new WOption();
        }else if(index == 5){
            dialog = new WPopUpBox("Load Game","\\s[18]Do you want to load the latest \\n save data？\\n（The unsaved data will be lost）");
            dialog.endDo = function(e){
                dialog = null;
                if(e == 0){
                    _sf.dispose("loadGame");
                }else{
                    showMenu();
                }
            };
            return;
        }else if(index == 6){
            dialog = new WPopUpBox("Return to Title"," \\s[18]Do you want to return to title？\\n（The unsaved data will be lost）");
            dialog.endDo = function(e){
                dialog = null;
                if(e == 1){
                    _sf.dispose("backTitle");
                }else{
                    showMenu();
                }
            };
            return;
        }
        dialog.endDo = function(e){
            dialog = null;
            showMenu();
        };

    }
    /**
     * Show keys info
     * @param hash
     */
    function showKey(hash){
        if(IsPC()){
            var arr = [];
            var info =["Up","Down","Left","Right","Jump","Run","Attack","Ok","Menu/Close","Item1",
                "Item2","Item3","Item4","Skill1","Skill2","Skill3","Skill4","Skill5"];
            var bitmap = hash[resList[5]];
            backKey = new ISprite(520,310,IColor.Transparent());
            backKey.x = RF.PointTranslation(_sf , backKey , backKeyX , "x");
            backKey.y = RF.PointTranslation(_sf , backKey , backKeyY , "y");
            backKey.z = 1160;
            for (var i in RC.Key) {
                arr.push(RC.Key[i]);
            }
            for(i = 0; i< 18; i++){
                if(i < 9){
                    backKey.drawBitmap(hash[resList[5]],0,i *(bitmap.height + 2),false);
                    backKey.drawTextQ(RC.CodeToSting(arr[i]),18,6 + i * (bitmap.height + 2),RV.setColor.wBase,14);
                    backKey.drawTextQ(info[i],120,5 + i * (bitmap.height + 2),RV.setColor.wBase,15)
                }else{
                    backKey.drawBitmap(hash[resList[5]],backKey.width / 2 ,(i - 9) *(bitmap.height + 2),false);
                    backKey.drawTextQ(RC.CodeToSting(arr[i]),18 + bitmap.width + 5,6 + (i - 9) * (bitmap.height + 2),RV.setColor.wBase,14);
                    backKey.drawTextQ(info[i],120 + bitmap.width + 5,5 + (i - 9) * (bitmap.height + 2),RV.setColor.wBase,15)
                }
            }
        }else{
            backKey = new ISprite(hash[resList[4]]);
            backKey.x = RF.PointTranslation(_sf , backKey , backKeyX , "x");
            backKey.y = RF.PointTranslation(_sf , backKey , backKeyY , "y");
            backKey.z = 1160;
            backKey.drawTextQ("Skills",519,0,RV.setColor.wBase,14);
            backKey.drawTextQ("Jump",575,255,RV.setColor.wBase,14);
            backKey.drawTextQ("Attack",479,355,RV.setColor.wBase,14);
            backKey.drawTextQ("Use Items",276,341,RV.setColor.wBase,14);
            backKey.drawTextQ("Move",72,342,RV.setColor.wBase,14);
        }
    }
    /**
     * Hide menu
     */
    function hideMenu(){
        backKey.addAction(action.fade,1,0,10);
        back.addAction(action.fade,1,0,10);
        for(var i = 0; i<menuButton.length;i++){
            menuButton[i].fadeTo(0,10);
        }
       if(chooseBox != null) chooseBox.addAction(action.fade,1,0,10);
    }
    /**
     * Show menu
     */
    function showMenu(){
        backKey.addAction(action.fade,0,1,10);
        back.addAction(action.fade,0,1,10);
        for(var i = 0; i<menuButton.length;i++){
            menuButton[i].fadeTo(1,10);
        }
        if(chooseBox != null) chooseBox.addAction(action.fade,0,1,10);
        if(shortcut != null) shortcut.shortcutList(0);

    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if (dialog != null && dialog.update()) return true;
        if(updatePCKey()) return true;
        for(var i = 0; i < menuButton.length; i++){
            if(menuButton[i].update()){//If you click the i-th button
                RV.GameSet.playEnterSE();
                updateButton(i);
                return true
            }
            if(menuButton[i].isOn()){//If you hovers on the i-th button
                updateBlock(i)
            }
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(menu){
        if (_sf.endDo != null) _sf.endDo(menu);
        for(var i = 0; i < menuButton.length; i++){
            menuButton[i].dispose()
        }
        IInput.keyCodeAry = [];
        back.dispose();
        cover.dispose();
        if(chooseBox != null) chooseBox.dispose();
        if(shortcut != null) shortcut.dispose();
        backKey.dispose();
    };

}/**
 * Created by YewMoon on 2019/4/25.
 * Game interface·Inquiry box
 * @param msg | contents
 * @param confirm | text of confirm button
 * @param cancel | text of cancel button
 */
function WMessageBox(msg,confirm,cancel){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_0";
    //Close button
    var buttonCloseX = "back_right_-30";
    var buttonCloseY = "back_top_12";
    //Confirm button
    var buttonSureX = "";
    var buttonSureY = "";
    if(cancel == ""){//if set no words on cancel button
        buttonSureX = "back_center_0";
        buttonSureY = "back_bottom_-20";
    }else{
        buttonSureX = "back_left_60";
        buttonSureY = "back_bottom_-20";
    }
    //Cancel button
    var buttonCancelX = "back_right_-60";
    var buttonCancelY = "back_bottom_-20";
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Return value
    var message = null;
    //Back
    var back = null;
    //Close button
    var buttonClose = null;
    //confirm button
    var buttonSure = null;
    //cancel button
    var buttonCancel = null;
    //resource list
    var resList = null;
    //shortcut
    var shortcut = null;
    //Preload complete
    var loadOver = false;
    resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Confirm/back-main.png",
        "System/button-all_0.png",
        "System/button-all_1.png"
    ];
    //Preload images
    RF.CacheUIRes(resList,init);
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init (hash){
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1500;
        //Close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1510;
        //confirm button
        buttonSure = new IButton(hash[resList[3]],hash[resList[4]],"",null,true);
        buttonSure.x = RF.PointTranslation(_sf , buttonSure , buttonSureX , "x");
        buttonSure.y = RF.PointTranslation(_sf , buttonSure , buttonSureY , "y");
        buttonSure.z = 1510;
        var spriteSure = buttonSure.getSprite();
        spriteSure.drawText("\\s[15]" + confirm,(buttonSure.width - IFont.getWidth(confirm,15)) / 2,(buttonSure.height - IFont.getHeight(confirm,15)) / 2,0,RV.setColor.button,false,140);
        //cancel button
        if(cancel != ""){
            buttonCancel = new IButton(hash[resList[3]],hash[resList[4]],"",null,true);
            buttonCancel.x = RF.PointTranslation(_sf , buttonCancel , buttonCancelX , "x");
            buttonCancel.y = RF.PointTranslation(_sf , buttonCancel , buttonCancelY , "y");
            buttonCancel.z = 1510;
            var spriteCancel = buttonCancel.getSprite();
            spriteCancel.drawText("\\s[15]"+ cancel,(buttonCancel.width - IFont.getWidth(cancel,15)) / 2,(buttonCancel.height - IFont.getHeight(cancel,15)) / 2,0,RV.setColor.button,false,140);
        }
        //draw text
        var message = RF.TextAnalysisNull(msg);
        var msgText = message.split(RF.CharToAScII(200));
        var drawMsg = msg.split("\\n");
        var width = 0;
        var line = 0;
        for(var i = 0;i<msgText.length;i++){
            var txtW = IFont.getWidth(msgText[i], 16);
            if(txtW > width){
                width = txtW;
            }
            line += Math.ceil(txtW / 350.0);
        }
        if(line > 1){
            width = parseInt(Math.min(350,width));
        }

        for(i = 0;i<drawMsg.length;i++){
            back.drawText("\\s[16]" + drawMsg[i],(back.width - width) / 2,(back.height - buttonSure.height - line * 16) / 2 + 18 * i,0,RV.setColor.wBase,true,width + (back.width - width) / 2);
        }
        if(IsPC()){
            shortcut = new WShortcut();
            shortcut.shortcutList(7);
        }
        loadOver = true;
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if(buttonSure.update()|| IInput.isKeyDown(RC.Key.ok)){//press buttonSure
            RV.GameSet.playEnterSE();
            _sf.dispose(1);
            return true
        }
        if(buttonCancel != null && buttonCancel.update()|| IInput.isKeyDown(RC.Key.cancel) || buttonClose.update()){//press cancel button、Close button
            RV.GameSet.playCancelSE();
            _sf.dispose();
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(message){
        if (_sf.endDo != null) _sf.endDo(message);
        back.dispose();
        buttonSure.dispose();
        if(buttonCancel != null) buttonCancel.dispose();
        buttonClose.dispose();
        if(shortcut != null) shortcut.dispose();
    }
}/**
 * Created by YewMoon on 2019/3/4.
 * Game interface·options
 */
function WOption(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_0";
    //Close button
    var buttonCloseX = "back_right_-40";
    var buttonCloseY = "back_top_12";
    //offset of choose box
    var chooseBoxX = 108;
    var chooseBoxY = - 7;
    //Vertical spacing of choose box
    var chooseBoxGap = 6;
    //text of “BGM”,Relative coordinates of back
    var textBgmX = 116;
    var textBgmY = 92;
    //text of “SE”,Relative coordinates of back
    var textSeX = 116;
    var textSeY = 132;
    //title,Relative coordinates of back
    var textTitleX = 0;
    var textTitleY = 12;
    //BGM left button-minus
    var buttonLeftBgmX = "back_center_-15";
    var buttonLeftBgmY = "back_center_-15";
    //BGM right button-plus
    var buttonRightBgmX = "buttonLeftBgm_left_120";
    var buttonRightBgmY = "back_center_-15";
    //Back of BGM，x is relative coordinates of left button
    var showVolBgmX = 100;
    var showVolBgmY = "back_center_-18";
    //SE left button-minus
    var buttonLeftSeX = "back_center_-15";
    var buttonLeftSeY = "buttonLeftBgm_top_40";
    //SE right button-plus
    var buttonRightSeX = "buttonLeftBgm_left_120";
    var buttonRightSeY = "buttonLeftBgm_top_40";
    //Back of SE，x is relative coordinates of left button
    var showVolSeX = 100;
    var showVolSeY = "buttonLeftBgm_top_39";
    //Default button
    var buttonDefaultX = "back_right_-30";
    var buttonDefaultY = "back_bottom_-20";
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Back
    var back = null;
    //Back of BGM
    var showVolBgm = null;
    //Back of SE
    var showVolSe = null;
     //BGM left button-minus
    var buttonLeftBgm = null;
    //BGM right button-plus
    var buttonRightBgm = null;
    //SE left button-minus
    var buttonLeftSe = null;
    //SE right button-plus
    var buttonRightSe = null;
    //Default button
    var buttonDefault = null;
    //Close button
    var buttonClose = null;
    //selection index
    var selectIndex = 0;
    //resource list
    var resList = null;
    //choose box
    var boxChoose = null;
    //Preload complete
    var loadOver = false;

    resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/Option/back-main.png",
        "System/Menu/Option/button-left_0.png",
        "System/Menu/Option/button-left_1.png",
        "System/Menu/Option/button-left_2.png",
        "System/Menu/Option/button-right_0.png",
        "System/Menu/Option/button-right_1.png",
        "System/Menu/Option/button-right_2.png",
        "System/button-all_0.png",
        "System/button-all_1.png",
        "System/Menu/Option/choose-box.png"
    ];
    //Preload resource
    RF.CacheUIRes(resList,init);
    //==================================== Private functions ===================================
    /**
     * preload function
     * @param hash
     */
    function init (hash){
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1500;
        //Close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1510;
        //text of "BGM" and "SE"
        back.drawTextQ("BGM",textBgmX,textBgmY,RV.setColor.wBase,18);
        back.drawTextQ("SE",textSeX,textSeY,RV.setColor.wBase,18);
        //title
        back.drawTextQ("Options",(back.width - IFont.getWidth("Options",30)) / 2 + textTitleX,textTitleY,RV.setColor.wBase,30);
       
        buttonLeftBgm = new IButton(hash[resList[3]],hash[resList[4]]);
        buttonLeftBgm.x = RF.PointTranslation(_sf , buttonLeftBgm , buttonLeftBgmX , "x");
        buttonLeftBgm.y = RF.PointTranslation(_sf , buttonLeftBgm , buttonLeftBgmY , "y");
        buttonLeftBgm.z = 1510;
        buttonLeftBgm.setEnableBitmap(hash[resList[5]]);
       
        buttonRightBgm = new IButton(hash[resList[6]],hash[resList[7]]);
        buttonRightBgm.x = RF.PointTranslation(_sf , buttonRightBgm , buttonRightBgmX , "x");
        buttonRightBgm.y = RF.PointTranslation(_sf , buttonRightBgm , buttonRightBgmY , "y");
        buttonRightBgm.z = 1510;
        buttonRightBgm.setEnableBitmap(hash[resList[8]]);

        showVolBgm = new ISprite(32,IFont.getHeight(RV.GameSet.BGMVolume / 10,16) * 1.2,IColor.Transparent());
        showVolBgm.x = buttonLeftBgm.x + buttonLeftBgm.width + (showVolBgmX - buttonLeftBgm.width - IFont.getWidth("9",16)) / 2;
        showVolBgm.y = RF.PointTranslation(_sf , showVolBgm , showVolBgmY , "y");
        showVolBgm.z = 1510;
        drawVol(RV.GameSet.BGMVolume / 10,showVolBgm)
        
        buttonLeftSe = new IButton(hash[resList[3]],hash[resList[4]]);
        buttonLeftSe.x = RF.PointTranslation(_sf , buttonLeftSe , buttonLeftSeX , "x");
        buttonLeftSe.y = RF.PointTranslation(_sf , buttonLeftSe , buttonLeftSeY , "y");
        buttonLeftSe.z = 1510;
        buttonLeftSe.setEnableBitmap(hash[resList[5]]);
   
        buttonRightSe = new IButton(hash[resList[6]],hash[resList[7]]);
        buttonRightSe.x = RF.PointTranslation(_sf , buttonRightSe , buttonRightSeX , "x");
        buttonRightSe.y = RF.PointTranslation(_sf , buttonRightSe , buttonRightSeY , "y");
        buttonRightSe.z = 1510;
        buttonRightSe.setEnableBitmap(hash[resList[8]]);
       
        showVolSe = new ISprite(32,IFont.getHeight(RV.GameSet.SEVolume / 10,16) * 1.2,IColor.Transparent());
        showVolSe.x = buttonLeftSe.x + buttonLeftSe.width + (showVolSeX - buttonLeftSe.width - IFont.getWidth("9",16)) / 2;
        showVolSe.y = RF.PointTranslation(_sf , showVolSe , showVolSeY , "y");
        showVolSe.z = 1510;
        drawVol(RV.GameSet.SEVolume / 10,showVolSe)
        
        buttonDefault = new IButton(hash[resList[9]],hash[resList[10]]," ",null,true);
        buttonDefault.x = RF.PointTranslation(_sf , buttonDefault , buttonDefaultX , "x");
        buttonDefault.y = RF.PointTranslation(_sf , buttonDefault , buttonDefaultY , "y");
        buttonDefault.z = 1510;
        buttonDefault.drawTitleQ("Default",RV.setColor.wBase,14);
        //choose box
        if(IsPC()){
            boxChoose = new ISprite(hash[resList[11]]);
            boxChoose.x = back.x + chooseBoxX;
            boxChoose.y = buttonLeftBgm.y + chooseBoxY;
            boxChoose.z = buttonLeftBgm.z;
        }
        loadOver = true
    }
    /**
     * check available status of button
     * @param vol | current volume
     * @param buttonLeft | minus button
     * @param buttonRight | plus button
     */
    function volButtonSwitch(vol,buttonLeft,buttonRight){
        buttonLeft.setEnable(vol > 0);
        buttonRight.setEnable(vol < 10);
    }
    /**
     * draw volume
     * @param vol | volume
     * @param show | back
     */
    function drawVol(vol,show){
        show.clearBitmap();
        show.drawTextQ(vol,(show.width - IFont.getWidth(vol,16)) / 2,0,RV.setColor.wBase,16);
    }
    /**
     * update choose box
     * @param index | selected option 0:BGM，1：SE
     */
    function updateChoose(index){
        if(boxChoose == null) return;
        if(index != selectIndex){
            boxChoose.x = back.x + chooseBoxX;
            boxChoose.y = buttonLeftBgm.y + chooseBoxY + index * (boxChoose.height + chooseBoxGap);
            selectIndex = index;
            RV.GameSet.playSelectSE();
        }

    }
    /**
     * update PC key selection
     */
    function updatePCKey(){
        if(boxChoose == null) return;
        var tempSelectIndex = -1;
        //down
        if(IInput.isKeyDown(RC.Key.down)){
            tempSelectIndex = selectIndex + 1;
            if(tempSelectIndex > 1) tempSelectIndex = 1;
            updateChoose(tempSelectIndex);
            return true;
        }
        //up
        if(IInput.isKeyDown(RC.Key.up)){
            tempSelectIndex = selectIndex - 1;
            if(tempSelectIndex < 0) tempSelectIndex = 0;
            updateChoose(tempSelectIndex);
            return true;
        }
        //left
        if(IInput.isKeyDown(RC.Key.left)){
            if(selectIndex == 0){
                if(RV.GameSet.BGMVolume / 10 > 0) RV.GameSet.BGMVolume -= 10;
                drawVol(RV.GameSet.BGMVolume / 10,showVolBgm);
            }else{
                if(RV.GameSet.SEVolume / 10 > 0) RV.GameSet.SEVolume -= 10;
                drawVol(RV.GameSet.SEVolume / 10,showVolSe)
            }

            return true;
        }
        //right
        if(IInput.isKeyDown(RC.Key.right)){
            if(selectIndex == 0){
                if(RV.GameSet.BGMVolume / 10 < 10) RV.GameSet.BGMVolume += 10;
                drawVol(RV.GameSet.BGMVolume / 10,showVolBgm)
            }else{
                if(RV.GameSet.SEVolume / 10 < 10) RV.GameSet.SEVolume += 10;
                drawVol(RV.GameSet.SEVolume / 10,showVolSe)
            }
            return true;
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if(updatePCKey()) return true;
        if(volButtonSwitch(RV.GameSet.BGMVolume / 10,buttonLeftBgm,buttonRightBgm)) return true;
        if(volButtonSwitch(RV.GameSet.SEVolume / 10,buttonLeftSe,buttonRightSe)) return true;
        if(IInput.isKeyDown(RC.Key.cancel) || buttonClose.update()){//press cancel button / Close button
            RV.GameSet.playCancelSE();
            RV.GameSet.save();
            _sf.dispose();
            return true
        }
        if(buttonLeftBgm.update()){//press BGM-minus button
            RV.GameSet.playEnterSE();
            if(RV.GameSet.BGMVolume / 10 > 0) RV.GameSet.BGMVolume -= 10;
            drawVol(RV.GameSet.BGMVolume / 10,showVolBgm);
            updateChoose(0)
            return true
        }
        if(buttonRightBgm.update()){//press BGM-plus button
            RV.GameSet.playEnterSE();
            if(RV.GameSet.BGMVolume / 10 < 10) RV.GameSet.BGMVolume += 10;
            drawVol(RV.GameSet.BGMVolume / 10,showVolBgm);
            updateChoose(0)
            return true
        }
        if(buttonLeftSe.update()){//press SE-minus button
            RV.GameSet.playEnterSE();
            if(RV.GameSet.SEVolume / 10 > 0) RV.GameSet.SEVolume -= 10;
            drawVol(RV.GameSet.SEVolume / 10,showVolSe);
            updateChoose(1)
            return true
        }
        if(buttonRightSe.update()){//press SE-plus button
            RV.GameSet.playEnterSE();
            if(RV.GameSet.SEVolume / 10 < 10) RV.GameSet.SEVolume += 10;
            drawVol(RV.GameSet.SEVolume / 10,showVolSe);
            updateChoose(1)
            return true
        }
        //Default
        if(buttonDefault.update() || IInput.isKeyDown(RC.Key.ok)){//press Default button
            RV.GameSet.playEnterSE();
            RV.GameSet.BGMVolume = 100;
            RV.GameSet.SEVolume = 100;
            drawVol(RV.GameSet.BGMVolume / 10,showVolBgm);
            drawVol(RV.GameSet.SEVolume / 10,showVolSe);
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(load){
        if (_sf.endDo != null) _sf.endDo(load);
        back.dispose();
        buttonDefault.dispose();
        buttonLeftBgm.dispose();
        buttonRightBgm.dispose();
        buttonLeftSe.dispose();
        buttonRightSe.dispose();
        buttonClose.dispose();
        showVolBgm.dispose();
        showVolSe.dispose();
        if(boxChoose != null) boxChoose.dispose();
    }
}/**
 * Created by YewMoon on 2019/3/1.
 * Game interface·Load & Return to title
 * @param title | title
 * @param msg | contents
 */
function WPopUpBox(title,msg){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_0";
    //Close button
    var buttonCloseX = "back_right_-30";
    var buttonCloseY = "back_top_12";
    //title,Relative coordinates of back
    var textTitleX = 0;
    var textTitleY = 12;
    //Confirm button
    var buttonSureX = "back_left_60";
    var buttonSureY = "back_bottom_-20";
    //cancel button
    var buttonCancelX = "back_right_-60";
    var buttonCancelY = "back_bottom_-20";
    //text,Relative coordinates of back
    var msgX = 88;
    var msgY = 74;
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Return value
    var message = null;
    //Back
    var back = null;
    //Close button
    var buttonClose = null;
    //confirm button
    var buttonSure = null;
    //cancel button
    var buttonCancel = null;
    //resource list
    var resList = null;
    //Preload complete
    var loadOver = false;

    resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/back-point.png",
        "System/button-all_0.png",
        "System/button-all_1.png",
    ];
    //Preload resource
    RF.CacheUIRes(resList,init);
    //==================================== Private functions ===================================
    /**
     * preload function
     * @param hash
     */
    function init (hash){
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1500;
        //Close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1510;
        //title
        back.drawTextQ(title,(back.width - IFont.getWidth(title,30)) / 2 + textTitleX,textTitleY,RV.setColor.wBase,30);
        //confirm button
        buttonSure = new IButton(hash[resList[3]],hash[resList[4]]," ",null,true);
        buttonSure.x = RF.PointTranslation(_sf , buttonSure , buttonSureX , "x");
        buttonSure.y = RF.PointTranslation(_sf , buttonSure , buttonSureY , "y");
        buttonSure.z = 1510;
        buttonSure.drawTitleQ("Confirm",RV.setColor.wBase,14);
        //cancel button
        buttonCancel = new IButton(hash[resList[3]],hash[resList[4]]," ",null,true);
        buttonCancel.x = RF.PointTranslation(_sf , buttonCancel , buttonCancelX , "x");
        buttonCancel.y = RF.PointTranslation(_sf , buttonCancel , buttonCancelY , "y");
        buttonCancel.z = 1510;
        buttonCancel.drawTitleQ("Cancel",RV.setColor.wBase,14);
        //text
        back.drawText(msg,msgX,msgY,0,RV.setColor.wBase,false,338);
        loadOver = true;
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if(buttonSure.update()|| IInput.isKeyDown(RC.Key.ok)){//press confirm button
            RV.GameSet.playEnterSE();
            if(title == "Load Game"){
                _sf.dispose(0);
           }else{
               _sf.dispose(1);
           }
            return true
        }
        if(buttonCancel.update()|| IInput.isKeyDown(RC.Key.cancel) || buttonClose.update()){//press cancel button or Close button
            RV.GameSet.playCancelSE();
            _sf.dispose();
            return true
        }
        return true
  };
    /**
     * Dispose this interface
     */
    this.dispose = function(message){
        if (_sf.endDo != null) _sf.endDo(message);
        back.dispose();
        buttonSure.dispose();
        buttonCancel.dispose();
        buttonClose.dispose();
    }
}/**
 * Created by YewMoon on 2019/4/8.
 * Game interface·Shop
 * @param items | data of goods
 */
function WShop(items){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //cover
    var coverX = 0;
    var coverY = 0;
    //back
    var backX = "scene_center_0";
    var backY = "scene_center_-25";
    //title
    var titleX = 0;
    var titleY = 14;
    //Buy / sell tab
    var checkX = "back_left_60";
    var checkY = "back_top_90";
    //Close button
    var buttonCloseX = "back_right_-50";
    var buttonCloseY = "back_top_14";
    //viewPort
    var vpStockX = "back_left_60";
    var vpStockY = "back_top_152";
    //goods buttons
    var buttonGoodsX = 32;
    var buttonGoodsY = 2;
    //horizontal spacing of goods button
    var buttonGoodsGapX = 22;
    //Vertical spacing of goods button
    var buttonGoodsGapY = 20;
    //Maximum per line
    var buttonMaxLine = 5;
    //offset of choose box，Relative coordinates of goods Icon
    var boxChooseX = - 1;
    var boxChooseY = - 1;
    //Show details-Coordinates of back
    var baseDetailsX = "back_left_530";
    var baseDetailsY = "back_top_144";
    //Show details-goods board
    var boardX = 0;
    var boardY = 4;
    //Show details-goods icon
    var iconX = 4;
    var iconY = 4;
    //Show details-name of goods
    var nameX = 62;
    var nameY = 0;
    //Show details-possession
    var numX = 62;
    var numY = 44;
    //Show details-description
    var msgX = 0;
    var msgY = 68;
    //sum number
    var baseNumX = "back_left_534";
    var baseNumY = "back_top_144";
    //text of sum number
    var sumNumX = 94;
    var sumNumY = 180;
    //gold icon of total price
    var miniIconX = 54;
    var miniIconY = 220;
    //width and height of gold Icon
    var miniIconWidth = 20;
    var miniIconHeight = 20;
    //total price
    var priceX = 80;
    var priceY = 220;
    //button minus
    var buttonMinusX = "back_left_554";
    var buttonMinusY = "back_top_314";
    //button plus
    var buttonPlusX = "buttonMinus_right_96";
    var buttonPlusY = "back_top_314";
    //button buy / sell
    var buttonDealX = "buttonMinus_left_14";
    var buttonDealY = "back_top_384";
    //text “Out of Stock”
    var tipX = "back_left_210";
    var tipY = "back_top_260";
    //gold icon
    var coinIconX = 616;
    var coinIconY = 92;
    //gold number
    var moneyX = 710;
    var moneyY = 96;
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //goods data
    var purchaseDate = items;
    //items of current actor
    var saleData = [];
    //initialize data
    var data = purchaseDate;
    //cover
    var cover = null;
    //Back
    var back = null;
    //Back of shortcut
    var shortcut = null;
    //Close button
    var buttonClose = null;
    //viewPort
    var vpStock = null;
    //goods button array
    var buttonGoods = [];
    //buy / sell button
    var buttonDeal = null;
    //plus button
    var buttonPlus = null;
    //minus button
    var buttonMinus = null;
    //board of Show details
    var baseDetails = null;
    //board of number
    var baseNum = null;
    //choose box
    var boxChoose = null;
    //sprite of icon
    var tempPic = null;
    //sprite of "Out of Stock"
    var tip = null;
    //resource list
    var resList = null;
    var resHash = null;
    //Total number of items currently selected
    var sumNum = 1;
    //wait time of plus button
    var waitTime = 0;
    //Maximum selectable number of items
    var maxNum = 99;
    //possession
    var num = 0;
    //total price
    var price = 0;
    //selection index
    var selectIndex = 0;
    //id of selected goods
    var nowItem = 0;
    //checkBox
    var checkBox = [];
    //Preload complete
    var loadOver = false;
    resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/icon_coin.png",
        "System/Shop/back-main.png",
        "System/board-store.png",
        "System/choose-box.png",
        "System/Shop/check-sale_0.png",
        "System/Shop/check-sale_1.png",
        "System/button-function_0.png",
        "System/button-function_1.png",
        "System/button-function_2.png",
        "System/button-plus_0.png",
        "System/button-plus_1.png",
        "System/button-plus_2.png",
        "System/button-minus_0.png",
        "System/button-minus_1.png",
        "System/button-minus_2.png"
    ];
    //Preload resource
    RF.CacheUIRes(resList,init);
    //==================================== Private functions ===================================
    /**
     * update items of current actor
     */
    function updateSaleData(){
        saleData = [];
        for(var i = 0; i < RV.GameData.items.length; i++){
            if(RV.GameData.items[i].findData().price > 0){
                saleData.push(RV.GameData.items[i])
            }
        }
    }
    /**
     * preload function
     * @param hash
     */
    function init(hash){
        resHash = hash;
        updateSaleData();
        //cover
        cover = new ISprite(IVal.GWidth,IVal.GHeight,IColor.Black());
        cover.x = coverX;
        cover.y = coverY;
        cover.z = 1150;
        cover.opacity = 0.7;
        //Back
        back = new ISprite(hash[resList[3]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1600;
        drawTitle();
        //Close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1630;
        //checkBox
        for(var i = 0; i< 2; i++){
            var check = new ICheck(hash[resList[6]],hash[resList[7]]," ",null,i == 0);
            check.x = RF.PointTranslation(_sf , check , checkX , "x") + i * check.width;
            check.y = RF.PointTranslation(_sf , check , checkY , "y");
            check.z = back.z + 10;
            if(i == 0){
                check.drawTitleQ("Buy",RV.setColor.wBase,14)
            }else{
                check.drawTitleQ("Sell",RV.setColor.wBase,14)
            }
            check.setOtherCheck(checkBox);
            checkBox[i] = check;
        }
        //draw gold of actor
        drawWallet();
        //draw goods
        drawStock(purchaseDate,hash);
        if(IsPC()){
            shortcut = new WShortcut();
            shortcut.shortcutList(12);
        }
        loadOver = true;
    }
    /**
     * Draw Title
     */
    function drawTitle(){
        var title = "Shop"
        back.drawTextQ(title,(back.width - IFont.getWidth(title,30)) / 2 + titleX,titleY,RV.setColor.wBase,30);
    }
    /**
     * draw button of buy, sell, plus and minus
     * @param hash
     */
    function drawCtrlButton(hash){
        if(buttonMinus != null) buttonMinus.disposeMin();
        if(buttonPlus != null) buttonPlus.disposeMin();
        if(buttonDeal != null) buttonDeal.disposeMin();
        if(data.length >0){
            buttonMinus = new IButton(hash[resList[14]],hash[resList[15]]);
            buttonMinus.x = RF.PointTranslation(_sf , buttonMinus , buttonMinusX , "x");
            buttonMinus.y = RF.PointTranslation(_sf , buttonMinus , buttonMinusY , "y");
            buttonMinus.z = back.z + 20;
            buttonMinus.setEnableBitmap(hash[resList[16]]);
            buttonMinus.setEnable(false);

            buttonPlus = new IButton(hash[resList[11]],hash[resList[12]]);
            buttonPlus.x = RF.PointTranslation(_sf , buttonPlus , buttonPlusX , "x");
            buttonPlus.y = RF.PointTranslation(_sf , buttonPlus , buttonPlusY , "y");
            buttonPlus.z = back.z + 20;
            buttonPlus.setEnableBitmap(hash[resList[13]]);
    
            buttonDeal = new IButton(hash[resList[8]],hash[resList[9]]," ");
            buttonDeal.x = RF.PointTranslation(_sf , buttonDeal , buttonDealX , "x");
            buttonDeal.y = RF.PointTranslation(_sf , buttonDeal , buttonDealY , "y");
            buttonDeal.z = back.z + 20;
            buttonDeal.setEnableBitmap(hash[resList[10]]);
            if(data == purchaseDate){
                buttonDeal.drawTitleQ("Buy",RV.setColor.wBase,14)
            }else{
                buttonDeal.drawTitleQ("Sell",RV.setColor.wBase,14)
            }
        }

    }
    /**
     * draw gold of actor
     */
    function drawWallet(){
        back.clearBitmap();
        back.drawBitmap(RF.LoadCache(resList[2]),coinIconX,coinIconY,false);
        back.drawTextQ(RV.GameData.money,moneyX - IFont.getWidth(RV.GameData.money,16),moneyY,RV.setColor.wBase,16);
        drawTitle();
    }
    /**
     * draw goods
     * @param data | data of goods
     * @param hash
     */
    function drawStock(data,hash){
        if(vpStock != null) vpStock.dispose();
        if(tip != null) tip.dispose();
        buttonGoods = [];
        if(baseDetails != null) baseDetails.disposeMin();
        if(baseNum != null) baseNum.disposeMin();
        drawCtrlButton(resHash);
        if(data.length <=0){
            tip = new ISprite(IBitmap.CBitmap(200,100),null);
            tip.x = RF.PointTranslation(_sf , tip , tipX , "x");
            tip.y = RF.PointTranslation(_sf , tip , tipY , "y");
            tip.z = back.z + 10;
            tip.drawTextQ("Out of Stock",0,0,RV.setColor.wBase,26);
            return;
        }
        //viewport
        vpStock = new IViewport(0,0,430,290);
        vpStock.x = RF.PointTranslation(_sf , vpStock , vpStockX , "x");
        vpStock.y = RF.PointTranslation(_sf , vpStock , vpStockY , "y");
        vpStock.z = back.z + 10;
        vpStock.isAutoMove = true;
        vpStock.dir = IViewport.Dir.Vertical;
        for(var i = data.length - 1; i>=0; i--){
            if(data[i].num <= 0){
                data.splice(i,1);
                i = data.length
            }
        }
        var buttonLength = data.length;
        for(i = 0;i< buttonLength ;i++){
            var button = initButton(hash ,
                i >= data.length ? 0 : data[i], vpStock);
            button.x = (i % buttonMaxLine) *(button.width + buttonGoodsGapX) + buttonGoodsX;
            button.y = parseInt(i / buttonMaxLine) *(button.height + buttonGoodsGapY) + buttonGoodsY;
            button.z = 1630;
            buttonGoods.push(button);
        }
        //initialize choose box
        if(data.length > 0){
            boxChoose = new ISprite(hash[resList[5]],vpStock);
            updateChoose(selectIndex);
            boxChoose.z = 1640;
        }
        //initialize details
        baseDetails = new ISprite(IBitmap.CBitmap(184,380));
        baseDetails.x = RF.PointTranslation(_sf , baseDetails , baseDetailsX , "x");
        baseDetails.y = RF.PointTranslation(_sf , baseDetails , baseDetailsY , "y");
        baseDetails.z = 1620;

        baseNum = new ISprite(IBitmap.CBitmap(180,380));
        baseNum.x = RF.PointTranslation(_sf , baseNum , baseNumX , "x");
        baseNum.y = RF.PointTranslation(_sf , baseNum , baseNumY , "y");
        baseNum.z = 1620;
        if(buttonGoods.length != 0 && boxChoose.x == buttonGoods[0].x + boxChooseX){
            showDetails(buttonGoods[0].tag);
        }else{
            if(buttonGoods.length != 0)showDetails(buttonGoods[selectIndex].tag);
        }
    }
    /**
     * initialize goods button
     * @param hash 
     * @param item | item data
     * @param viewPort | viewport
     */
    function initButton(hash , item , viewPort){
        var tempButton = new IButton(hash[resList[4]], hash[resList[4]],"",viewPort , true);
        if(item.id >= 0){
            drawItemButton(tempButton,item);
        }
        tempButton.tag = item;
        return tempButton;
    }
    /**
     * draw icon of goods
     * @param button | board of button
     * @param item | item data
     */
    function drawItemButton(button,item){
        if(item.id >= 0){
            var cof = item.findData();
            var opacity = 1.0;
            if(data == purchaseDate && cof.price > RV.GameData.money){
                opacity = 0.5;
            }
            tempPic = button.getSprite();
            tempPic.opacity = opacity;
            tempPic.clearBitmap();
            if(cof != null) {
                tempPic.drawBitmap(RF.LoadCache("Icon/" + cof.icon),iconX,iconY,false);
            }
        }
        button.tag = item;
    }
    /**
     * draw details of goods
     * @param tag | goods id
     */
    function showDetails(tag){
        if(baseDetails != null) baseDetails.clearBitmap();
        updateEnable();
        if(tag.id > 0 && baseDetails != null){
            var cof = tag.findData();
            sumNum = 1;
            if(data == purchaseDate){
                for(var i = 0; i<RV.GameData.items.length; i++){
                    var tempItem = RV.GameData.items[i];
                    if(tag.type == tempItem.type && tag.id == tempItem.id){
                        num = RV.GameData.items[i].num;
                        break
                    }else{
                        num = 0
                    }
                }
                price = cof.price;
                maxNum = 99;
            }else{
                num = tag.num;
                price = Math.ceil(cof.price / 2);
                maxNum = num;
            }
            updateSumNum(tag);
            baseDetails.drawBitmap(RF.LoadCache(resList[4]),boardX,boardY,false);
            baseDetails.drawBitmap(RF.LoadCache("Icon/" + cof.icon),iconX,iconY,false);
            baseDetails.drawText("\\s[15]" + cof.name,nameX,nameY,0,RV.setColor.wBase,true,174);
            baseDetails.drawTextQ("Possession：" + num,numX,numY,RV.setColor.wBase,15);
            baseDetails.drawText("\\s[14]" + cof.msg,msgX,msgY,0,RV.setColor.wBase,true,174);
            nowItem = tag;
            return;
        }
        nowItem = 0;
    }
    /**
     * draw number and price
     * @param tag | goods id
     */
    function updateSumNum(tag){
        if(baseNum != null) baseNum.clearBitmap();
        if(tag.id > 0 && baseNum != null){
            var cof = tag.findData();
            if(data == purchaseDate){
                for(var i = 0; i<RV.GameData.items.length; i++){
                    var tempItem = RV.GameData.items[i];
                    if(tag.type == tempItem.type && tag.id == tempItem.id){
                        num = RV.GameData.items[i].num;
                        break
                    }else{
                        num = 0
                    }
                }
                price = cof.price;
                maxNum = 99;
            }else{
                num = tag.num;
                price = Math.ceil(cof.price / 2);
                maxNum = num;
            }
            updateEnable();
            baseNum.drawBitmapRect(RF.LoadCache(resList[2]),new IRect(miniIconX,miniIconY,miniIconX + miniIconWidth,miniIconY + miniIconHeight),false);
            baseNum.drawTextQ(price * sumNum,priceX,priceY,RV.setColor.wBase,15);
            baseNum.drawTextQ(sumNum,sumNumX - IFont.getWidth(sumNum,16),sumNumY,RV.setColor.wBase,16);
        }
    }
    /**
     * update button
     * @param data | goods data
     */
    function updateButton(data){
        for(var i = 0; i< data.length; i++){
            if (buttonGoods[i].update()) {
                updateChoose(i);
                return true
            }
        }
        for(i = 0; i< 2; i++){
            if(checkBox[i].update()){
                switchData(i)
                return true
            }
        }
    }
    /**
     * update choose box
     * @param index | index of item button
     */
    function updateChoose(index){
        if(index != selectIndex){
            RV.GameSet.playSelectSE();
        }
        if(buttonGoods[index].tag.id > 0){
            boxChoose.x = buttonGoods[index].x + boxChooseX;
            boxChoose.y = buttonGoods[index].y + boxChooseY;
            showDetails(buttonGoods[index].tag);
            selectIndex = index;
        }
    }
    /**
     * check available status of button
     */
    function updateEnable(){
        buttonPlus.setEnable(true);
        buttonMinus.setEnable(true);
        buttonDeal.setEnable(true);
        if(data == purchaseDate){
            if(price * (sumNum + 1) > RV.GameData.money){
                if(buttonPlus != null) buttonPlus.setEnable(false);
            }
            if(price * sumNum> RV.GameData.money){
                if(buttonDeal != null) buttonDeal.setEnable(false);
            }
            if(num + sumNum >= maxNum || sumNum >= maxNum){
                if(buttonPlus != null) buttonPlus.setEnable(false);
            }
            if(num >= maxNum){
                if(buttonDeal != null) buttonDeal.setEnable(false);
            }
        }else if(sumNum >= num){
            if(buttonPlus != null) buttonPlus.setEnable(false);
        }
        if(sumNum == 1){
            if(buttonMinus != null) buttonMinus.setEnable(false);
        }
    }
    /**
     * change the function of button
     * @param index
     */
    function switchData(index){
      if(index == 0){
          if(buttonDeal != null) buttonDeal.drawTitleQ("Buy",RV.setColor.wBase,14)
          data = purchaseDate;
      }else{
          if(buttonDeal != null) buttonDeal.drawTitleQ("Sell",RV.setColor.wBase,14)
          updateSaleData();
          data = saleData;
      }
        selectIndex = 0;
        drawStock(data,resHash);
    }
    /**
     * logic of buy and sell button
     */
    function updateDealButton(){
        if(data == purchaseDate){//buy
            RV.GameData.addItem(nowItem.type,nowItem.id,sumNum);
            RV.GameData.money -= (price * sumNum);
            updateSaleData();
            if(price > RV.GameData.money) drawStock(data,resHash)
        }else{//sell
            RV.GameData.discardItem(nowItem, sumNum);
            RV.GameData.money += (price * sumNum);
            updateSaleData();
            if(nowItem.num <= 0 || saleData.length == 0){
                data = saleData;
                selectIndex = 0;
                drawStock(data,resHash);
                updateEnable();
            }
        }
    }
    /**
     * update PC key selection
     */
    function updatePCKey(){
        if(IInput.isKeyDown(RC.Key.jump)){
            if(data == purchaseDate){
                checkBox[1].clickBox();
                switchData(1)
            }else{
                checkBox[0].clickBox();
                switchData(0)
            }
            return true;
        }
        if(boxChoose != null && data.length != 0){
            var tempSelectIndex = -1;
            //down
            if(IInput.isKeyDown(RC.Key.down)){
                tempSelectIndex = selectIndex + buttonMaxLine;
                if(tempSelectIndex > buttonGoods.length - 1) tempSelectIndex = buttonGoods.length - 1;
                updateChoose(tempSelectIndex);
                if(boxChoose.y >= vpStock.height) vpStock.oy = - (boxChoose.y - 3 *(boxChoose.height + buttonGoodsGapY) + buttonGoodsGapY / 3);
                return true;
            }
            //up
            if(IInput.isKeyDown(RC.Key.up)){
                tempSelectIndex = selectIndex - buttonMaxLine;
                if(tempSelectIndex < 0) tempSelectIndex = 0;
                updateChoose(tempSelectIndex);
                if(boxChoose.y <= buttonGoodsGapY + buttonGoodsY) vpStock.oy = - boxChoose.y;
                return true;
            }
            //left
            if(IInput.isKeyDown(RC.Key.left)){
                tempSelectIndex = selectIndex - 1;
                if(tempSelectIndex < 0) tempSelectIndex = 0;
                updateChoose(tempSelectIndex);
                if(boxChoose.y <= buttonGoodsGapY + buttonGoodsY) vpStock.oy = - boxChoose.y;
                return true;
            }
            //right
            if(IInput.isKeyDown(RC.Key.right)){
                tempSelectIndex = selectIndex + 1;
                if(tempSelectIndex > buttonGoods.length - 1) tempSelectIndex = buttonGoods.length - 1;
                updateChoose(tempSelectIndex);
                if(boxChoose.y >= vpStock.height) vpStock.oy = - (boxChoose.y - 3 *(boxChoose.height + buttonGoodsGapY) + buttonGoodsGapY / 3);
                return true;
            }
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if(!loadOver) return true;
        if(vpStock != null && vpStock.updateMove()) return true;
        if(updatePCKey()) return true;
        updateButton(data);
        if(IInput.isKeyDown(RC.Key.cancel) || buttonClose.update()){//press Close button
            RV.GameSet.playCancelSE();
            _sf.dispose();
            return true
        }
        if(buttonDeal == null || buttonPlus == null || buttonMinus == null) return true;
        if(waitTime >= 15 || buttonPlus.update()){
            RV.GameSet.playEnterSE();
            if(sumNum < maxNum){
                sumNum += 1;
                updateSumNum(nowItem);
                updateEnable();
            }
            waitTime = 0;
            return true
        }
        if(waitTime <= - 15 || buttonMinus.update()){
            RV.GameSet.playEnterSE();
            if(sumNum > 1){
                sumNum -= 1;
                updateSumNum(nowItem);
                updateEnable();
            }
            waitTime = 0;
            return true
        }
        if((buttonPlus.getBack().isSelectTouch() && buttonPlus.getEnable() && IInput.down)|| (buttonPlus.getEnable() && IInput.isKeyPress(RC.Key.atk))){//press plus button
            waitTime += 1;
        }
        if(buttonMinus.getBack().isSelectTouch() && IInput.down || (buttonMinus.getEnable() && IInput.isKeyPress(RC.Key.run))){//press minus button
            waitTime -= 1;
        }
        if(buttonDeal.update() || (buttonDeal.getEnable() && IInput.isKeyDown(RC.Key.ok))){//press buy/sell button
            RV.GameSet.playEnterSE();
            updateDealButton();
            showDetails(nowItem);
            drawWallet();
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(){
        if (_sf.endDo != null) _sf.endDo();
        cover.dispose();
        back.dispose();
        if(shortcut != null) shortcut.dispose();
        buttonClose.dispose();
        if(vpStock != null) vpStock.dispose();
        for(var i = 0; i< data.length; i++){
            buttonGoods[i].dispose();
        }
        for(i = 0; i< 2; i++){
            checkBox[i].dispose()
        }
        if(buttonDeal != null) buttonDeal.dispose();
        if(buttonPlus != null) buttonPlus.dispose();
        if(buttonMinus != null) buttonMinus.dispose();
        if(baseDetails != null) baseDetails.dispose();
        if(baseNum != null) baseNum.dispose();
        if(boxChoose != null) boxChoose.dispose();
        if(tempPic != null) tempPic.dispose();
        if(tip != null) tip.dispose();
    }
}/**
 * Created by YewMoon on 2019/3/26.
 * Game interface·shortcut
 */
function WShortcut(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //shortcut
    var backShortcutX = 0;
    var backShortcutY = "scene_bottom_-5";
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Private attributes ===================================
    //back
    var backShortcut = null;
    backShortcut = new ISprite(IVal.GWidth,44,IColor.Transparent());
    backShortcut.x = backShortcutX;
    backShortcut.y = RF.PointTranslation(_sf , backShortcut , backShortcutY , "y");
    backShortcut.z = 1600;
    backShortcut.opacity = 0.8;
    //==================================== Private Function ===================================
    /**
     * draw shortcut
     * @param buttonText | text of button
     * @param str | function of button
     * @param position | position
     */
    function drawShortcut(buttonText,str,position){
        var bitmap = RF.LoadCache("System/key_blank.png");
        var fontSize = 16;
        var dir = - 1;
        if(IFont.getWidth(buttonText,16) >= 30) fontSize = 14;
        if(IFont.getWidth(buttonText,14) >= 30) fontSize = 10;
        var buttonX = (backShortcut.width - 34 - IFont.getWidth(str,14) - 10) / position;
        backShortcut.drawBitmapRect(bitmap,new IRect(buttonX,(backShortcut.height - 34) / 2,buttonX + 34,(backShortcut.height - 34) / 2 + 34),false);
        backShortcut.drawTextQ(buttonText,buttonX + (34 - IFont.getWidth(buttonText,fontSize)) / 2 + dir,(34 - IFont.getHeight(buttonText,fontSize)) / 2,RV.setColor.shortcut,fontSize);
        backShortcut.drawTextQ(str,buttonX + 34 + 10,(backShortcut.height - IFont.getHeight(str,16))/ 2 - 2,RV.setColor.wBase,16)
    }
    //==================================== Public Function ===================================
    /**
     * shortcut list
     * @param index 0:menu,1:Equipment,2:skills,3:inventory,4:options,5:load game,6:return to title,7:Inquiry box,
     * 8:Equipment bag,9:skill selection,10:item selection,11:number selection,12:Shop,13:Game over,14:Game win
     */
    this.shortcutList = function(index){
        //draw shortcut
        if(backShortcut != null){
            backShortcut.clearBitmap();
            backShortcut.drawRect(new IRect(0,0,IVal.GWidth,44),IColor.Black());
            if(index == 0){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Confirm",3);
            }else if(index == 1){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Confirm",3);
            }else if(index == 2){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Put/Unload",3);
            }else if(index == 3){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.4);
                drawShortcut(RC.CodeToSting(RC.Key.jump),"Put/Unload",3.6);
                drawShortcut(RC.CodeToSting(RC.Key.run),"Remove",1.7);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Use",2.2);
            }else if(index == 4){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.45);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Default",1.9);
                drawShortcut(RC.CodeToSting(RC.Key.right),"Plus",2.5);
                drawShortcut(RC.CodeToSting(RC.Key.left),"Minus",3.5);
            }else if(index == 5 || index == 6 || index == 7){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close/Cancel",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Confirm",3);
            }else if(index == 8){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Equip/Change",3);
                drawShortcut(RC.CodeToSting(RC.Key.run),"Unload",2);
            }else if(index == 9){
                drawShortcut(RC.CodeToSting(RC.Key.skill1),"Slot1",6.8);
                drawShortcut(RC.CodeToSting(RC.Key.skill2),"Slot2",3.7);
                drawShortcut(RC.CodeToSting(RC.Key.skill3),"Slot3",2.5);
                drawShortcut(RC.CodeToSting(RC.Key.skill4),"Slot4",1.9);
                drawShortcut(RC.CodeToSting(RC.Key.skill5),"Slot5",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.2);
            }else if(index == 10){
                drawShortcut(RC.CodeToSting(RC.Key.item1),"Slot1",4.2);
                drawShortcut(RC.CodeToSting(RC.Key.item2),"Slot2",2.8);
                drawShortcut(RC.CodeToSting(RC.Key.item3),"Slot3",2.1);
                drawShortcut(RC.CodeToSting(RC.Key.item4),"Slot4",1.7);
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.4);
            }else if(index == 11){
                drawShortcut(RC.CodeToSting(RC.Key.left),"Minus",4.2);
                drawShortcut(RC.CodeToSting(RC.Key.right),"Plus",2.8);
                drawShortcut(RC.CodeToSting(RC.Key.atk),"Max",2.1);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Confirm",1.7);
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.4);
            }else if(index == 12){
                drawShortcut(RC.CodeToSting(RC.Key.jump),"Switch",4.3);
                drawShortcut(RC.CodeToSting(RC.Key.run),"Minus",2.7);
                drawShortcut(RC.CodeToSting(RC.Key.atk),"Plus",2.1);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Buy/Sell",1.62);
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"Close",1.3);
            }else if(index == 13){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"To Title",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Load Game",3);
            }else if(index == 14){
                drawShortcut(RC.CodeToSting(RC.Key.cancel),"To Title",1.5);
                drawShortcut(RC.CodeToSting(RC.Key.ok),"Restart",3);
            }
        }
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(){
        backShortcut.dispose();
    }
}/**
 * Created by YewMoon on 2019/3/1.
 * Game interface·skills
 * @param shortcut | shortcut
 */
function WSkill(shortcut){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_-25";
    //title
    var titleX = 0;
    var titleY = 14;
    //"Skills"
    var textSkillX = 77;
    var textSkillY = 90;
    //"Skills Slots"
    var textShortcutX = 77;
    var textShortcutY = 335;
    //Close button
    var buttonCloseX = "back_right_-50";
    var buttonCloseY = "back_top_14";
    //viewPort of skills
    var vpX = "back_left_90";
    var vpY = "back_top_136";
    //skill button
    var buttonSkillX = 20;
    var buttonSkillY = 4;
    //horizontal spacing
    var buttonSkillGapX = 80;
    //vertical spacing
    var buttonSkillGapY = 25;
    //Maximum per line
    var buttonMaxLine = 3;
    //offset of choose box，Relative coordinates of skill Icon
    var boxChooseX = - 1;
    var boxChooseY = - 1;
    //number of slots
    var buttonNum = 5;
    //skill slots
    var buttonShortcutX = "back_left_82";
    var buttonShortcutY = "back_bottom_-46";
    //spacing of slots
    var buttonShortcutGap = 26;
    //offset of slots' choose box
    var boxChooseShortcutX = -200;
    var boxChooseShortcutY = 1640;
    //details-Coordinates of back
    var baseDetailsX = "back_left_526";
    var baseDetailsY = "back_top_100";
    //Put/Unload button
    var buttonControlX = "baseDetails_center_0";
    var buttonControlY = "back_bottom_-50";
    //Icon offset
    var iconX = 4;
    var iconY = 4;
    //unlock mask
    var coverLockX = 0;
    var coverLockY = 0;
    //back of unlock skill,  Relative coordinates of back
    var baseLockX = 1;
    var baseLockY = 0;
    //height of unlock skill back
    var baseLockHeight = 17;
    //text of unlock skill
    var textLockX = 0;
    var textLockY = 0;
    //Show details-equipped or not,Relative coordinates of baseDetails
    var equipOffOnX = 116;
    var equipOffOnY = 2;
    //Show details-skill name,Relative coordinates of baseDetails
    var detailsNameX = 0;
    var detailsNameY = 0;
    //Show details-line1,Relative coordinates of baseDetails
    var lineX_1 = 0;
    var lineY_1 = 23;
    //Show details-width and height of line1
    var lineWidth_1 = 190;
    var lineHeight_1 = 1;
    //Show details-board of skill,Relative coordinates of baseDetails
    var detailsBoardX = 0;
    var detailsBoardY = 42;
    //Show details-cost MP,Relative coordinates of baseDetails
    var detailsMPX = 110;
    var detailsMPY = 60;
    //Show details-CD Time,Relative coordinates of baseDetails
    var detailsCdX = 110;
    var detailsCdY = 84;
    //Show details-line2,Relative coordinates of baseDetails
    var lineX_2 = 0;
    var lineY_2 = 114;
    //Show details-width and height of line2
    var lineWidth_2 = 190;
    var lineHeight_2 = 1;
    //Show details-“Details”,Relative coordinates of baseDetails
    var detailsTitleX = 0;
    var detailsTitleY = 130;
    //Show details-Description,Relative coordinates of baseDetails
    var detailsMsgX = 0;
    var detailsMsgY = 160;
    /**
     * Expose private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Back
    var back = null;
    //Close button
    var buttonClose = null;
    //viewport
    var vp = null;
    //skill buttons array
    var buttonSkill = [];
    //skill slots array
    var buttonShortcut = [];
    //choose box
    var boxChoose = null;
    //slots' choose box
    var boxChooseShortcut = null;
    //put、Unload button
    var buttonControl = null;
    //board of Show details
    var baseDetails = null;
    //resource list
    var resList = null;
    //Preload complete
    var loadOver = false;
    //skills of current actor
    var skillData = [];
    var dataSkill = RV.GameData.actor.getSetData().skills;

    for(i= 0; i< dataSkill.length; i++){
        var tempdata = {
            level : dataSkill[i].level,
            skillId : dataSkill[i].skillId,
            isStudy : RV.GameData.actor.skill.indexOf(dataSkill[i].skillId) >= 0
        };
        if(RV.GameData.actor.level >= tempdata.level  && !tempdata.isStudy){
        }else{
            skillData.push(tempdata)
        }
    }

    for(var i= 0; i< RV.GameData.actor.skill.length; i++){
        var id = RV.GameData.actor.skill[i];
        if(!findStudySkill(id)){
            var tempSkill = {
                level: 1,
                skillId: id,
                isStudy : true
            };
            skillData.push(tempSkill)
        }
    }

    var tempPic = null;
    //selection index
    var selectButtonIndex = 0;
    var selectShortcutIndex = -1;
    //Dialog window
    var dialog = null;
    //id of selected skill
    var nowSkillId = 0;
    var resHash = null;

    //List of resources required in this interface
    resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/Skill/back-main.png",
        "System/board-store.png",
        "System/choose-box.png",
        "System/button-function_0.png",
        "System/button-function_1.png",
        "System/button-function_2.png",
    ];
    //Preload resource
    RF.CacheUIRes(resList,init);
    //==================================== Private functions ===================================
    /**
     * whether skills have been added to the skills array
     * @param id | target id
     */
    function findStudySkill(id){
        for(var i = 0;i<skillData.length;i++){
            if(skillData[i].skillId === id){
                return skillData;
            }
        }
        return null;
    }
    /**
     * preload function
     * @param hash
     */
    function init (hash){
        resHash = hash;
        //set Back
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1500;
        drawTitle();
        //Close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]],"",vp);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1630;
        //set skill viewport
        vp = new IViewport(0,0,460,176);
        vp.x = RF.PointTranslation(_sf , vp , vpX , "x");
        vp.y = RF.PointTranslation(_sf , vp , vpY , "y");
        vp.z = 1620;
        vp.isAutoMove = true;
        vp.dir = IViewport.Dir.Vertical;
        //draw skill buttons array
        var buttonLength = skillData.length;
        if(buttonLength <= 0){
            buttonLength = buttonMaxLine * 2;
        }
        for(var i = 0;i< buttonLength ;i++){
            var button = initSkillButton(hash ,
                i >= skillData.length ? 0 : skillData[i].skillId,
                i >= skillData.length ? false : skillData[i].isStudy, vp,
                i >= skillData.length ? 0 : skillData[i].level
            );
            button.x = (i % buttonMaxLine) * (button.width + buttonSkillGapX) + buttonSkillX;
            button.y = parseInt(i / buttonMaxLine) * (button.height + buttonSkillGapY) + buttonSkillY;
            button.z = 1630;
            buttonSkill.push(button);
        }
        //draw skill slots
        for(i = 0; i< buttonNum; i++){
            button = initSkillButton(hash ,RV.GameData.userSkill[i],false,null,0);
            button.x = RF.PointTranslation(_sf , button , buttonShortcutX , "x") + i * (button.width + buttonShortcutGap);
            button.y = RF.PointTranslation(_sf , button , buttonShortcutY , "y");
            button.z = 1610;
            buttonShortcut.push(button);
        }
        //initialize choose box
        boxChoose = new ISprite(hash[resList[4]],vp);
        boxChoose.x = buttonSkill[0].x + boxChooseX;
        boxChoose.y = buttonSkill[0].y + boxChooseY;
        boxChoose.z = 1640;
        boxChooseShortcut = new ISprite(hash[resList[4]]);
        boxChooseShortcut.x = boxChooseShortcutX;
        boxChooseShortcut.y = boxChooseShortcutY;
        boxChooseShortcut.z = 1640;
        
        baseDetails = new ISprite(196,300,IColor.Transparent());
        baseDetails.x = RF.PointTranslation(_sf , baseDetails , baseDetailsX , "x");
        baseDetails.y = RF.PointTranslation(_sf , baseDetails , baseDetailsY , "y");
        baseDetails.z = 1620;
        showDetails(buttonSkill[0].tag);
        
        buttonControl = new IButton(hash[resList[5]], hash[resList[6]]," ",null,true);
        buttonControl.x = RF.PointTranslation(_sf , buttonControl , buttonControlX , "x");
        buttonControl.y = RF.PointTranslation(_sf , buttonControl , buttonControlY , "y");
        buttonControl.z = 1630;
        buttonControl.setEnableBitmap(hash[resList[7]]);
        buttonControl.setEnable(skillData.length > 0);
        updateChoose(0,buttonSkill);
        buttonControl.tag = 0;
        buttonControl.drawTitleQ("Put",RV.setColor.wBase,14);
        loadOver = true
    }
    /**
     * Draw Title and text
     */
    function drawTitle(){
        var title = "Skills"
        back.drawTextQ(title,(back.width - IFont.getWidth(title,30)) / 2 + titleX,titleY,RV.setColor.wBase,30);
        back.drawTextQ("Skills",textSkillX,textSkillY,RV.setColor.wBase,16);
        back.drawTextQ("Skills Slots",textShortcutX,textShortcutY,RV.setColor.wBase,16);
    }
    /**
     * initialize skill button
     * @param hash 
     * @param skillId | skill id
     * @param isStudy | Whether the skills are learned
     * @param viewPort | viewport of skill buttons
     * @param level | Skill unlock level
     */
    function initSkillButton(hash , skillId , isStudy , viewPort,level ){
        var tempButton = new IButton(hash[resList[3]], hash[resList[3]],"",viewPort , true);
        //Set image of button disable status
        tempButton.setEnableBitmap(hash[resList[3]]);
        if(skillId >= 0){
            drawSkillButton(tempButton,skillId,isStudy,level);
        }
        tempButton.tag = skillId;
        return tempButton;
    }
    /**
     * draw skill icon
     * @param button | skill button
     * @param skillId | skill id
     * @param isStudy | Whether the skills are learned
     * @param level | Skill unlock level
     */
    function drawSkillButton(button,skillId,isStudy,level){
        if(skillId >= 0){
            var cof = RV.NowSet.findSkillId(skillId);
            var tempPic = button.getSprite();
            tempPic.clearBitmap();
            if(cof != null){
                tempPic.drawBitmap(RF.LoadCache("Icon/" + cof.icon),iconX,iconY,false);
                //the skill is unlock
                if(!isStudy && level != 0){
                    tempPic.drawRect(new IRect(coverLockX,coverLockY,tempPic.width,tempPic.height),new IColor(0,0,0,175));
                    tempPic.drawRect(new IRect(baseLockX,(tempPic.height - baseLockHeight) / 2 + baseLockY,tempPic.width - 2,(tempPic.height - baseLockHeight) / 2 + baseLockHeight),new IColor(0,0,0,255));
                    var str = "LV" + level ;
                    var w = IFont.getWidth(str,12);
                    tempPic.drawTextQ(str,(tempPic.width - w) / 2 + textLockX,(tempPic.height - baseLockHeight) / 2 + textLockY,RV.setColor.wBase,12);
                    button.opacity = 0.95;
                }
            }
        }
        button.tag = skillId;
    }
    /**
     * Drag skill
     */
    function dropSkill(){
        //Drag end
        if(IInput.up && tempPic != null){
            IInput.dx = 0;
            IInput.dy = 0;
            for(var i = 0;i < buttonNum; i++){
                if(buttonShortcut[i].isOn() && tempPic){//if touch slots
                    fillInShortcut(i,tempPic.tag);
                    updateChoose(i,buttonShortcut);
                    showDetails(tempPic.tag);
                }
            }
            if(tempPic != null) {
                tempPic.disposeMin();
                tempPic = null;
            }
            return;
        }
        if(dropShortcut()) return;
        dropMain();
    }
    /**
     * drag skill of stock
     */
    function dropMain(){
        for(var i = 0;i<skillData.length;i++) {
            if (buttonSkill[i].update()) {
                RV.GameSet.playEnterSE();
                switchButton(0);
                updateChoose(i,buttonSkill);
                showDetails(buttonSkill[i].tag);
                return true
            }
            if (buttonSkill[i].isOn()) {
                if(IInput.move && buttonSkill[i].opacity >= 1){
                    newTempButton(i,0,buttonSkill[i].tag);
                    tempButtonMove();
                    return true
                }
                return true
            }
        }
    }
    /**
     * drag skill of slots
     */
    function dropShortcut(){
        for(var i = 0;i< buttonNum;i++){
            if (buttonShortcut[i].update() && buttonShortcut[i].tag > 0) {
                RV.GameSet.playEnterSE();
                switchButton(1);
                updateChoose( i , buttonShortcut);
                if(buttonShortcut[i].tag != null && RV.GameData.userSkill[i] != 0) showDetails(buttonShortcut[i].tag);
                return true
            }
            if(buttonShortcut[i].isOn() && IInput.move){
                newTempButton(i,1,buttonShortcut[i].tag);
                tempButtonMove();
                return true
            }
        }
        return false;
    }
    /**
     * Unload from slots
     * @param i | index of slots
     */
    function cancelSkill(i){
        RV.GameSet.playEquipSE();
        drawSkillButton(buttonShortcut[i],0,false,0);
        buttonShortcut[i].setEnable(true);
        RV.GameData.userSkill[i] = 0;
    }
    /**
     * Put skill in the slot
     * @param index |  index of slots
     * @param skillId | skill id
     */
    function fillInShortcut(index,skillId){
        for(var i = 0; i< buttonNum; i++){
            if(buttonShortcut[i].tag == skillId){
                cancelSkill(i);
            }
        }
        RV.GameSet.playEquipSE();
        drawSkillButton(buttonShortcut[index],skillId,false,0);
        buttonShortcut[index].setEnable(true);
        switchButton(1);
        RV.GameData.userSkill[index] = skillId;
    }
    /**
     * Draw a temporary button for drag
     * @param index | index of skill button
     * @param buttonType | button type 0button of stock 1slot
     * @param tag | skill id
     */
    function newTempButton(index,buttonType,tag){
        if(tag <= 0) return;
        if(tempPic == null){
            if(buttonType == 0){
                switchButton(0);
                tempPic = new ISprite(RF.LoadCache("Icon/" +RV.NowSet.findSkillId(tag).icon));
                tempPic.x = vp.x + vp.ox + buttonSkill[index].x + iconX;
                tempPic.y = vp.y + vp.oy + buttonSkill[index].y + iconY;
                updateChoose(index,buttonSkill);
                showDetails(buttonSkill[index].tag);
            }else if(buttonType == 1){
                switchButton(1);
                tempPic = new ISprite(RF.LoadCache("Icon/" +RV.NowSet.findSkillId(tag).icon));
                tempPic.x = buttonShortcut[index].x + iconX;
                tempPic.y = buttonShortcut[index].y + iconY;
                updateChoose(index,buttonShortcut);
                showDetails(buttonShortcut[index].tag);
            }
            tempPic.z = 1630;
            tempPic.opacity = 0.6;
            tempPic.tag = tag;
        }
    }
    /**
     * move of tempbutton
     */
    function tempButtonMove(){
        if(IInput.dx == 0 || IInput.dy == 0){
            IInput.dx = IInput.x;
            IInput.dy = IInput.y;
        }
        if(tempPic != null) tempPic.x += IInput.x - IInput.dx;
        if(tempPic != null) tempPic.y += IInput.y - IInput.dy;
        IInput.dx = IInput.x;
        IInput.dy = IInput.y;
    }
    /**
     * update choose box
     * @param index | index of skill button
     * @param button | button type: buttonSkill- button of stock, buttonShortcut-slot
     */
    function updateChoose(index,button){
        if(index != selectButtonIndex || index != selectShortcutIndex){
            RV.GameSet.playSelectSE();
        }
        if(button[index].tag > 0){
            if(button == buttonShortcut){
                boxChooseShortcut.x = button[index].x + boxChooseX;
                boxChooseShortcut.y = button[index].y + boxChooseY;
                boxChooseShortcut.visible = true;
                boxChoose.visible = false;
                selectShortcutIndex = index;
            }else{
                boxChoose.x = button[index].x + boxChooseX;
                boxChoose.y = button[index].y + boxChooseY;
                boxChoose.visible = true;
                boxChooseShortcut.visible = false;
                selectButtonIndex = index;
                selectShortcutIndex = -1;
            }
            buttonControl.setEnable(button[index].opacity >= 1);
        }
    }
    /**
     * change the function of button
     * @param index | 0Put 1Unload
     */
    function switchButton(index){
        if(index == 0){
            buttonControl.drawTitleQ("Put",RV.setColor.wBase,14)
            buttonControl.tag = 0;
        }else{
            buttonControl.drawTitleQ("Unload",RV.setColor.wBase,14)
            buttonControl.tag = 1;
        }
    }
    /**
     * logic of Put and Unload button
     * @param index | index of slots
     */
    function updateControlButton(index){
        if(buttonControl.tag == 0){//Put
            if(shortcut != null) shortcut.shortcutList(9);
            dialog = new WSkillSelect();
            dialog.endDo = function(e){
                dialog = null;
                if(e != null){
                    fillInShortcut(e,nowSkillId);
                    updateChoose(e,buttonShortcut);
                }
                if(shortcut != null) shortcut.shortcutList(2);
            };
        }else{//Unload
            cancelSkill(index);
            boxChooseShortcut.visible = false;
            updateChoose(0,buttonSkill);
            showDetails(buttonSkill[0].tag);
            switchButton(0);
        }
    }
    /**
     * draw details of skill
     * @param tag | skill id
     */
    function showDetails(tag){
        if(tag > 0){
            baseDetails.clearBitmap();
            baseDetails.drawTextQ( RV.GameData.userSkill.indexOf(tag) == -1 ?  "         Not" : "Equipped",equipOffOnX,equipOffOnY,RV.setColor.tag,14);
            baseDetails.drawTextQ(RV.NowSet.findSkillId(tag).name,detailsNameX,detailsNameY,RV.setColor.wBase,16);
            baseDetails.drawRect(new IRect(lineX_1,lineY_1,lineX_1 + lineWidth_1,lineY_1 + lineHeight_1),RV.setColor.wBase);
            baseDetails.drawBitmap(RF.LoadCache(resList[3]),detailsBoardX,detailsBoardY,false);
            baseDetails.drawBitmap(RF.LoadCache("Icon/" +RV.NowSet.findSkillId(tag).icon),iconX,detailsBoardY + iconY,false);
            baseDetails.drawTextQ("Cost MP：" + RV.NowSet.findSkillId(tag).useMp,baseDetails.width - detailsMPX,detailsMPY,RV.setColor.wBase,14);
            baseDetails.drawTextQ("CD：" + RV.NowSet.findSkillId(tag).cd + "s",baseDetails.width - detailsCdX,detailsCdY,RV.setColor.wBase,14);
            baseDetails.drawRect(new IRect(lineX_2,lineY_2,lineX_2 + lineWidth_2,lineY_2 + lineHeight_2),RV.setColor.wBase);
            baseDetails.drawTextQ("Details",(baseDetails.width - IFont.getWidth("Details",15)) / 2 + detailsTitleX,detailsTitleY,RV.setColor.wBase,15);
            baseDetails.drawText("\\s[14]" + RV.NowSet.findSkillId(tag).msg,detailsMsgX,detailsMsgY,0,RV.setColor.wBase,true,188);
            nowSkillId = tag;
            return;
        }
        nowSkillId = 0;
    }
    /**
     * update PC key selection
     */
    function updatePCKey(){
        if(boxChoose != null){
            //down
            if(IInput.isKeyDown(RC.Key.down)){
                keySelectMain(buttonMaxLine,2);
                return true;
            }
            //up
            if(IInput.isKeyDown(RC.Key.up)){
                keySelectMain(- buttonMaxLine,1);
                return true;
            }
            //right
            if(IInput.isKeyDown(RC.Key.right)){
                if(boxChoose.visible){
                    keySelectMain(1,0);
                }else{
                    keySelectShortcut(1);
                }
                return true;
            }
            //left
            if(IInput.isKeyDown(RC.Key.left)){
                if(boxChoose.visible){
                    keySelectMain(-1,0);
                }else{
                    keySelectShortcut(-1);
                }
                return true;
            }
        }
    }
    /**
     * update PC key selection of stock
     * @param add | slots number that the choose box move
     * @param isUpDown | type 1up 2down
     */
    function keySelectMain(add,isUpDown){
        var index = selectButtonIndex + add;
        if(isUpDown == 1){ // Up
            if(index < 0) index = 0;
            if(selectShortcutIndex >= 0){
                index -= add;
            }
            selectShortcutIndex = -1;
            switchButton(0);
        }else if(isUpDown == 2){ // Down
            if(index >= buttonSkill.length){
                var temp = -1;
                for(var i = 0;i<buttonShortcut.length;i++){
                    if(buttonShortcut[i].tag > 0){
                        temp = i;
                        break;
                    }
                }
                if(temp > -1){
                    selectShortcutIndex = temp;
                    switchButton(1);
                    updateChoose(temp,buttonShortcut);
                    showDetails(buttonShortcut[temp].tag);
                }
            }
        }
        index = Math.min(buttonSkill.length - 1,index);
        index = Math.max(0,index);
        if(selectShortcutIndex < 0){
            updateChoose(index,buttonSkill);
            showDetails(buttonSkill[index].tag);
            if(boxChoose.y >= 2 *(buttonSkillGapY + boxChoose.height + boxChooseY)) vp.oy = - (boxChoose.y - (boxChoose.height + buttonSkillGapY));
            if(boxChoose.y <= buttonSkillY) vp.oy = - boxChoose.y;
            selectButtonIndex = index;
        }
    }
    /**
     * update PC key selection of slots
     * @param add | slots number that the choose box move
     */
    function keySelectShortcut(add){
        var index = selectShortcutIndex + add;
        if(index < buttonNum && index >= 0 && buttonShortcut[index].tag <= 0){
            if(add >= 0){
                keySelectShortcut(add + 1);
            }else{
                keySelectShortcut(add - 1);
            }
        }else if(index < buttonNum && index >= 0){
            showDetails(buttonShortcut[index].tag);
            updateChoose(index,buttonShortcut);
            selectShortcutIndex = index;
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        if (dialog != null && dialog.update()) return true;
        if(tempPic == null && vp.updateMove()) return true;
        if(tempPic != null && tempButtonMove()) return true;
        if(updatePCKey()) return true;
        dropSkill();
        dropMain();
        dropShortcut();

        if((buttonControl.update() && tempPic == null) || (IInput.isKeyDown(RC.Key.ok)&& tempPic == null)){//press put button
            if(!buttonControl.getEnable()) return true;
            RV.GameSet.playEnterSE();
            updateControlButton(selectShortcutIndex);
            return true
        }
        if((IInput.isKeyDown(RC.Key.cancel) && tempPic == null) || (buttonClose.update() && tempPic == null)){//press Close button
            RV.GameSet.playCancelSE();
            _sf.dispose();
            return true;
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(skill){
        if (_sf.endDo != null) _sf.endDo(skill);
        back.dispose();
        buttonControl.dispose();
        baseDetails.dispose();
        vp.dispose();
        boxChoose.dispose();
        boxChooseShortcut.dispose();
        for(var i = 0;i < buttonSkill.length;i++){
            buttonSkill[i].dispose();
        }
        for(i = 0; i < buttonNum; i++){
            buttonShortcut[i].dispose();
        }
        buttonClose.dispose();
    };
}/**
 * Created by YewMoon on 2019/3/17.
 * Game interface·skills·Choose Slot
 */
function WSkillSelect(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Coordinates of back
    var backX = "scene_center_0";
    var backY = "scene_center_0";
    //Coordinates of  close button
    var buttonCloseX = "back_right_-30";
    var buttonCloseY = "back_top_12";
    //Coordinates of title,Relative coordinates of back
    var textTitleX = 0;
    var textTitleY = 12;
    //number of slots
    var buttonNum = 5;
    //Coordinates of slots
    var buttonX = "back_left_58";
    var buttonY = "back_top_110";
    //button spacing
    var buttonGap = 16;
    //Icon offset
    var iconX = 4;
    var iconY = 4;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Public attributes ===================================
    this.endDo = null;
    //==================================== Private attributes ===================================
    //Back board
    var back = null;
    //close button
    var buttonClose = null;
    //Choose Slots
    var buttonColumn = [];
    //preload completed
    var loadOver = false;
    //List of resources required in this interface
    var resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/Menu/back-point.png",
        "System/board-store.png"
    ];
    //Preload images
    RF.CacheUIRes(resList,init);
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        //Back board
        back = new ISprite(hash[resList[2]]);
        back.x = RF.PointTranslation(_sf , back , backX , "x");
        back.y = RF.PointTranslation(_sf , back , backY , "y");
        back.z = 1680;
        //title
        back.drawTextQ("Choose Slot",(back.width - IFont.getWidth("Choose Slot",30)) / 2 + textTitleX,textTitleY,RV.setColor.wBase,30);
        //draw close button
        buttonClose = new IButton(hash[resList[0]],hash[resList[1]]);
        buttonClose.x = RF.PointTranslation(_sf , buttonClose , buttonCloseX , "x");
        buttonClose.y = RF.PointTranslation(_sf , buttonClose , buttonCloseY , "y");
        buttonClose.z = 1690;
        //draw slots
        for(var i = 0; i < buttonNum; i++){
            var tempButton = new IButton(hash[resList[3]], hash[resList[3]],"",null,true);
            tempButton.x = RF.PointTranslation(_sf , tempButton , buttonX , "x") + i * (tempButton.width + buttonGap);
            tempButton.y = RF.PointTranslation(_sf , tempButton , buttonY , "y");
            tempButton.z = 1690;
            //zoom the button
            var tempSprite = tempButton.getSprite();
            //draw skills
            if(RV.GameData.userSkill[i] != 0){
                tempSprite.drawBitmap(RF.LoadCache("Icon/" +RV.NowSet.findSkillId(RV.GameData.userSkill[i]).icon),iconX,iconY,false);
            }
            buttonColumn[i] = tempButton;
        }
        loadOver = true
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function(){
        if (!loadOver) return true;
        for(var i = 0; i < buttonNum; i++){
            if(buttonColumn[i].update()){
                RV.GameSet.playEnterSE();
                _sf.dispose(i);
                return true
            }
        }
        //Press Skill-5
        if(IInput.isKeyDown(RC.Key.skill1)){
            RV.GameSet.playEnterSE();
            _sf.dispose(0);
            return true
        }
        if(IInput.isKeyDown(RC.Key.skill2)){
            RV.GameSet.playEnterSE();
            _sf.dispose(1);
            return true
        }
        if(IInput.isKeyDown(RC.Key.skill3)){
            RV.GameSet.playEnterSE();
            _sf.dispose(2);
            return true
        }
        if(IInput.isKeyDown(RC.Key.skill4)){
            RV.GameSet.playEnterSE();
            _sf.dispose(3);
            return true
        }
        if(IInput.isKeyDown(RC.Key.skill5)){
            RV.GameSet.playEnterSE();
            _sf.dispose(4);
            return true
        }
        //Press close button
        if(buttonClose.update() || IInput.isKeyDown(RC.Key.cancel)){
            _sf.dispose();
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(select){
        if (_sf.endDo != null) _sf.endDo(select);
        back.dispose();
        buttonClose.dispose();
        for(var i = 0; i < buttonNum; i++){
            buttonColumn[i].dispose()
        }
    }
}/**
 * Created by 七夕小雨 on 2019/06/21.
 */ /**
 * Created by Yitian Chen on 2019/1/4.
 */
function SStart(){
    //Whether to cache resource of character or not，it can increase the fluency of game map switching
    var cacheActor = true;

    var load = 0;
    //load project data
    RV.NowProject = new DProject(function(){
        load += 1;
    });
    //load resource data
    RV.NowRes = new DRes(function(){
        load += 1;
    });
    //load settings data
    RV.NowSet = new DSet(function(){
        load += 1;
    });
    //logo
    var logoBmp = RF.LoadBitmap("Picture/ifaction_logo.png");
    var logo = null;
    var background = null;
    var logoWait = 120;
    if(logoBmp != null){
        background = new ISprite(RV.NowProject.gameWidth,RV.NowProject.gameHeight,IColor.White());
        background.z = 9000;
        var w = IFont.getWidth("Powered by iFAction",18);
        background.drawTextQ("Powered by iFAction",
            RV.NowProject.gameWidth - w - 10,RV.NowProject.gameHeight - 30,
            IColor.CreatColor(87,87,87),18);
        logo = new ISprite(logoBmp);
        logo.z = 9010;
        logo.yx = 0.5;
        logo.yy = 0.5;
        logo.x = RV.NowProject.gameWidth / 2;
        logo.y = RV.NowProject.gameHeight / 2;
    }

    //Cache dialog bubble
    for(var i = 0; i < 9 ; i++){
        var nm = "back-text_" + i + ".png";
        RV.ToastPics[i] = RF.LoadBitmap("System/DialogBox/bubble/" + nm)
    }
    //Cache event image
    RF.LoadCache("System/icon_event.png");
    //load settings data
    RV.GameSet = new GSet();
    RV.GameSet.load();

    //load damage number
    var demagePic = [
        "System/number_0.png",
        "System/number_1.png",
        "System/number_2.png",
        "System/number_3.png",
        "System/miss.png"
    ];

    for(i = 0;i<5;i++){
        RV.NumberPics[i] = RF.LoadBitmap(demagePic[i]);
        RV.NumberPics[i].onload = function(){
            load += 1;
        }
    }

    //Main update
    this.update = function(){
        if(logoBmp != null){
            logoWait -= 1;
            if(logoWait > 0){
                return;
            }
        }
        if(load >= 7){
            RC.KeyInit();
            RF.LoadCache("System/icon_event.png");
            RV.InterpreterMain = new IMain();
            RV.InterpreterOther = [];
            this.dispose();
            RV.GameData = new GMain();
            load = -1;
            loadCache();
        }
    };
    //Main dispose
    this.dispose = function(){
        if(logoBmp != null){
            background.fadeTo(0,40);
            logo.fadeTo(0,40);
            background.setOnEndFade(function(){
                logo.dispose();
                background.dispose();
            });

        }
    };


    //Cache resource of character
    function loadCache(){
        if(cacheActor){
            for(var key in RV.NowRes.resActor.length){
                RV.NowRes.resActor[key].loadCache();
            }
        }
        IVal.scene = new STitle();
    }


}/**
 * Created by YewMoon on 2019/3/11.
 * Title
 */
function STitle() {
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //back
    var backX = IVal.GWidth / 2;
    var backY = IVal.GHeight / 2;
    //Game Name
    var gameNameX = "scene_center_0";
    var gameNameY = "scene_center_-90";
    //“New Game” button
    var buttonNewX = "scene_center_0";
    var buttonNewY = "gameName_bottom_170";
    //“Continue” button
    var buttonCtnX = "scene_center_0";
    var buttonCtnY = "buttonNew_bottom_80";
    //choose box
    var chooseBoxX = 0;
    var chooseBoxY = 0;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Private attributes ===================================
    //background image of title
    var back = null;
    //game name
    var gameName = null;
    //“New Game” button
    var buttonNew = null;
    //“Continue” button
    var buttonCtn = null;
    //choose box
    var choiceBox = null;
    //selection index
    var selectIndex = 0;
    //Preload complete
    var loadOver = null;
    //Dialog window
    var dialog = null;
    //read the game name in settings
    var nameText = RV.NowProject.name;
    //List of resources required in this interface
    var resList = ["System/button-close_0.png",
        "System/button-close_1.png",
        "System/"+RV.NowSet.setAll.titleFile,
        "System/Title/button-title_0.png",
        "System/Title/button-title_1.png",
        "System/Title/button-title_2.png",
        "System/Title/choose-box.png"];
    //If you do not skip the title, it will play music of title
    if(!RV.NowSet.setAll.skipTitle){
        //Preload images
        RF.CacheUIRes(resList, init);
        RV.GameSet.playBGM("Audio/"+RV.NowSet.setAll.titleMusic.file,RV.NowSet.setAll.titleMusic.volume);
    }
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init(hash) {
        //Set the background image of the title interface, with the center of the image as the starting point
        back = new ISprite(hash[resList[2]]);
        back.yx = 0.5;
        back.yy = 0.5;
        back.x = backX;
        back.y = backY;
        back.z = 1299;
        //show game name
        gameName = new ISprite(IFont.getWidth(nameText,54) * 1.4, IFont.getHeight(nameText,54) * 1.4, IColor.Transparent());
        gameName.x = RF.PointTranslation(_sf , gameName , gameNameX , "x");
        gameName.y = RF.PointTranslation(_sf , gameName , gameNameY , "y");
        gameName.z = 1300;
        gameName.drawTextQ(nameText,(gameName.width - IFont.getWidth(nameText,54)) / 2,(gameName.height - IFont.getHeight(nameText,54)) / 2,RV.setColor.cBase, 54);
       
        buttonNew = new IButton(hash[resList[3]], hash[resList[4]]," ");
        buttonNew.x = RF.PointTranslation(_sf , buttonNew , buttonNewX , "x");
        buttonNew.y = RF.PointTranslation(_sf , buttonNew , buttonNewY , "y");
        buttonNew.z = 1300;
        buttonNew.drawTitleQ("New Game",RV.setColor.cBase, 26);
        
        buttonCtn = new IButton(hash[resList[3]], hash[resList[4]]," ");
        
        buttonCtn.setEnableBitmap(hash[resList[5]]);
        buttonCtn.setEnable(GMain.haveFile());
        buttonCtn.x = RF.PointTranslation(_sf , buttonCtn , buttonCtnX , "x");
        buttonCtn.y = RF.PointTranslation(_sf , buttonCtn , buttonCtnY , "y");
        buttonCtn.z = 1300;
        buttonCtn.drawTitleQ("Continue",RV.setColor.cBase, 26);
        //the choose box will show in PC
         if(IsPC()){
            choiceBox = new ISprite(hash[resList[6]].width , hash[resList[6]].height,IColor.Transparent());
            choiceBox.x = buttonNew.x + chooseBoxX;
            choiceBox.y = buttonNew.y + chooseBoxY;
            choiceBox.z = 1350;
            choiceBox.drawBitmap(hash[resList[6]],0,0,false);
        }
       
        loadOver = true;
    }
    /**
     * Selection of PC button
     */
    function updatePCKey(){
        if(choiceBox != null){
            var tempSelectIndex = 0;
            //Press down button
            if(IInput.isKeyDown(RC.Key.down)){
                tempSelectIndex = selectIndex + 1;
                if(tempSelectIndex > 1) tempSelectIndex = 0;
                updateBlock(tempSelectIndex);
                return true;
            }
            //Press up button
            if(IInput.isKeyDown(RC.Key.up)){
                tempSelectIndex = selectIndex - 1;
                if(tempSelectIndex < 0) tempSelectIndex = 1;
                updateBlock(tempSelectIndex);
                return true;
            }
            //confirm
            if(IInput.isKeyDown(RC.Key.ok)){
                RV.GameSet.playEnterSE();
                if(selectIndex == 0){//“New game”
                    buttonNew.update();
                    updateButton(0);
                    return true;
                }else if(selectIndex == 1){//“Continue”
                    buttonCtn.update();
                    updateButton(1);
                    return true;
                }
            }
        }
    }
    /**
     * Update position of chooseBox
     * @param index 0:“New Game”is selected ,1:“Continue”is selected
     */
    function updateBlock(index){
        if(choiceBox == null || !GMain.haveFile()) return;
        if(index != selectIndex){
            if(index == 0){
                choiceBox.y = buttonNew.y;
            }else if(index == 1){
                choiceBox.y = buttonCtn.y;
            }
            selectIndex = index;
            RV.GameSet.playSelectSE();
        }
    }
    /**
     * Execute logic after buttons are pressed
     * @param index 0:New game ,1:continue
     */
    function updateButton(index){
        if(index == 0){
            if(GMain.haveFile()){//if the saved data is found
                dialog = new WMessageBox("\\s[18]Do you want to restart the game？","Confirm","Cancel");
                dialog.endDo = function(e){
                    dialog = null;
                    if(e == 1){
                        _sf.dispose();
                        IAudio.BGMFade(2);
                        RV.GameData.init();
                        IVal.scene = new SMain();
                    }
                }
            }else{
                RV.GameData.init();
                _sf.dispose();
                IAudio.BGMFade(2);
                IVal.scene = new SMain();
            }
        }else if(index == 1){//Load game
            RF.LoadGame();
        }
    }
    //==================================== Public Function ===================================
    /**
     * Update this interface
     */
    this.update = function () {
        //skip title
        if(RV.NowSet.setAll.skipTitle){
            RV.GameData.init();
            IVal.scene = new SMain();
            return true
        }
        if (!loadOver) return true;
        if (dialog != null && dialog.update()) return true;
        if (updatePCKey()) return true;
        //hover on buttonNew
        if(buttonNew.isOn()){
            updateBlock(0);
        }
        //hover on buttonCtn
        if(buttonCtn.isOn()){
            updateBlock(1);
        }
        //press buttonNew
        if (buttonNew.update()){
            RV.GameSet.playEnterSE();
            updateButton(0);
            return true
        }
        //Press buttonCtn
        if(buttonCtn.update()){
            RV.GameSet.playEnterSE();
            updateButton(1);
            return true
        }
        return true
    };
    /**
     * Dispose this interface
     */
    this.dispose = function(){
        back.dispose();
        gameName.dispose();
        buttonNew.dispose();
        buttonCtn.dispose();
        if(choiceBox != null) choiceBox.dispose();
    };
}/**
 * Created by Yitian Chen on 2019/1/3.
 * Game Main Scene
 */
function SMain(){
    var _sf = this;
    //==================================== Interface coordinates ===================================
    //Rocker
    var rockerX = 50;
    var rockerY = "scene_bottom_-30";
    //Menu button
    var buttonMenuX = "scene_right_-10";
    var buttonMenuY = 20;
    /**
     * Exposing private attributes
     */
    this.getEval = function(code){
        return eval(code);
    };
    //==================================== Private attributes ===================================
    var actor = null;
    //action control
    var ctrlAction = null;
    //inventory slots
    var ctrlItem = null;
    //actor status control
    var actorStatus = null;
    //buff
    var buff = null;
    //boss bar
    var bossBar = null;
    this.setBossBar = function(e){
        if(bossBar != null) {
            bossBar.dispose();
            bossBar = null;
        }
        bossBar = new CEnemyBossStatus(e)
    };
    //Map instantiation
    var map = new LMap(RV.GameData.mapId,function(object){
        ctrlAction = new CActorAction();
         //inventory slots
        ctrlItem = new CActorItem();
        //actor status control
        actorStatus = new CActorStatus();
        //buff
        buff = new CBuff();
        initActor(object);
    },RV.GameData.x,RV.GameData.y);
    //callback of changing map
    map.changeMap = function(object){
        if(bossBar != null) {
            bossBar.dispose();
            bossBar = null;
        }
        display.clear();
        initActor(object);
    };
    //Generate Canvas
    var display = new LCanvas();
    //Window blocking main thread execution
    var dialog = null;
    //not block main thread execution
    var dialogParallel = {};
    //Menu button
    var buttonMenu = null;
    //preload Variable
    var loadOver = false;
    //rocker
    var rocker = null;

    var dieWait = -1;

    //List of resources required in this interface
    RF.CacheUIRes(
        [
            "System/button-menu_0.png",
            "System/button-menu_1.png",
            "System/rocker_0.png",
            "System/rocker_1.png"
        ]
        , init);
    //==================================== Private Function ===================================
    /**
     * Preload function
     * @param hash
     */
    function init(hash){
        buttonMenu = new IButton(hash["System/button-menu_0.png"],hash["System/button-menu_1.png"]);
        buttonMenu.x = RF.PointTranslation(_sf , buttonMenu , buttonMenuX , "x");
        buttonMenu.y =  buttonMenuY;
        buttonMenu.z = 1005;
        buttonMenu.visible = RV.GameData.uiMenu;

        if(!IsPC()) {
            rocker = new CRocker(hash["System/rocker_0.png"] , hash["System/rocker_1.png"], 11);
            rocker.type = 0;
            rocker.x = rockerX;
            rocker.y = RF.PointTranslation(_sf , rocker , rockerY , "y");
            rocker.setVisible(RV.GameData.uiPhone);
        }

        loadOver = true
    }

    /**
     * Initialize the Actor object
     * @param object
     */
    function initActor(object){
        actor = object;
        //set Death callback
        actor.DieDo = function(){
            RV.IsDie = true;
            display.playAnim(RV.NowSet.setAll.actorDieAnimID,null,actor,true);
            if(RV.GameData.actor.hp <= 0){//Non-accidental deaths can be revived with resuscitation items
                // if the actor do not have resuscitation items，he will die.
                for(var i = 0;i<RV.GameData.items.length;i++){
                    var item = RV.GameData.items[i];
                    if(item.type == 0){
                        var cof = item.findData();
                        if(cof.afterDeath){
                            item.user(1);
                            RV.GameData.useItem(item.id,1);
                            ctrlItem.updateNum();
                            break;
                        }
                    }
                }
            }else{//accidental deaths
                //HP=0
                RV.GameData.actor.hp = 0;
                //update
                if(actorStatus != null){
                    actorStatus.update();
                }
            }
            dieWait = 20;
        };
        //set injured callback
        actor.InjuredDo = function(type,num){
            var number = 0;
            var showType = 0;
            if(type >= 4){
                showType = 2;
                if(type == 4){
                    number = num;
                }
                RV.GameData.actor.mp -= number;
            }else{
                showType = 0;
                if(type == 0){//Fixed value damage
                    number = num;
                }else if(type == 1){//Percent damage
                    number = RV.GameData.actor.getMaxHP() * num;
                }else if(type == 2){//damage caused by enemies‘ skills
                    obj = num;
                    if(obj == null) return;
                    if(obj.crit && obj.damage > 0){
                        showType = 1;
                    }

                    if(!actor.superArmor){
                        //Knockback
                        if(obj.dir == 1){
                            actor.getCharacter().x -= obj.repel;
                        }else{
                            actor.getCharacter().x += obj.repel;
                        }
                        //Launcher
                        actor.getCharacter().y -= obj.fly;
                    }

                    number = obj.damage;
                }else if(type == 3){//attack from enemy
                    var obj = RF.EnemyAtkActor(num);
                    if(obj == null) return;
                    if(obj.crit && obj.damage > 0){
                        showType = 1;
                    }
                    if(!actor.superArmor){
                        //Knockback
                        if(obj.dir == 1){
                            actor.getCharacter().x -= obj.repel;
                        }else{
                            actor.getCharacter().x += obj.repel;
                        }
                        //Launcher
                        actor.getCharacter().y -= obj.fly;
                    }
                    number = obj.damage;
                }
                //deductible by Gold
                if(number > 0){
                    var temp = parseInt(number * (RV.GameData.actor.subMoney() / 100));
                    RV.GameData.money -= parseInt(temp);
                    number -= temp;
                    if(RV.GameData.money <= 0){
                        number += Math.abs(RV.GameData.money);
                        RV.GameData.money = 0;
                    }
                }

                //deductible by MP
                if(number > 0){
                    temp = number * (RV.GameData.actor.subMp() / 100);
                    var mp = RV.GameData.actor.mp;
                    mp -= parseInt(temp);
                    number -= temp;
                    if(mp < 0){
                        RV.GameData.actor.mp = 0;
                        number += Math.abs(mp);
                    }else if(temp != 0){
                        RV.GameData.actor.mp = mp;
                        new LNum(2 , temp , map.getView() , actor.getCharacter().x , actor.getCharacter().y);
                    }
                }

                RV.GameData.actor.hp -= number;

            }
            if(number > 0){
                actor.stiff(10);
                actor.invincible(60);
                RV.GameData.actor.sumHp += number;
                if(actor.nowSkill != null){
                    if(actor.nowSkill.stopSkill()){
                        actor.nowSkill.update();
                        actor.nowSkill = null;
                    }

                }
            }
            new LNum(showType , number , map.getView() , actor.getCharacter().x , actor.getCharacter().y);



        };

        RV.GameData.actor.updateEquip();
    }
    //==================================== Public Function ===================================
    /**
     * Main update
     */
    this.update = function(){
        if(!loadOver) return true;
        if(dialog != null && dialog.update()) return true;
        for(var key in dialogParallel){
            dialogParallel[key].update();
        }
        if(IVal.scene != this) return true;
        if(display.update()) return true;
        if(rocker != null) {
            rocker.moveDir = -1;
            rocker.moveType = -1;
            rocker.update();
        }
        if(ctrlAction != null) ctrlAction.update();
        map.update();
        if(actorStatus != null) actorStatus.update();
        if(bossBar != null) bossBar.update();
        if(RV.InterpreterMain.update()) return true;
        doInterpreterOther();
        //update of common trigger
        for(var eid in RV.NowSet.setEvent){
            if(RV.NowSet.setEvent[eid].autoRun){
                RV.NowSet.setEvent[eid].doEvent();
            }
        }
        //pop up game over after actor die
        if(RV.IsDie && dieWait > 0){
            dieWait -= 1;
        }
        if(RV.IsDie && dieWait == 0){

            RF.GameOver();
            dieWait = -1;
            return;
        }

        //press buttonMenu
        if(buttonMenu.update() || IInput.isKeyDown(RC.Key.cancel)){
            RV.GameSet.playEnterSE();
            RF.GameMenu();
            IInput.keyCodeAry = [];
        }
        RV.GameData.actor.updateBuff();
        if(buff != null) buff.update();
        if(ctrlItem != null) ctrlItem.update();
        if(actor != null){
            if(!actor.isDie && ((rocker != null && rocker.moveDir == 2) || IInput.isKeyPress(RC.Key.right) ) ){
                if(!RV.GameData.actor.LMove) actor.moveRight();
            }

            if(!actor.isDie && ((rocker != null && rocker.moveDir == 1) || IInput.isKeyPress(RC.Key.left))){
                if(!RV.GameData.actor.LMove) actor.moveLeft();

            }
            if((!actor.isDie && !actor.atking()) && ((rocker != null && rocker.moveType == 2) || IInput.isKeyPress(RC.Key.run))){
                actor.speedUp();
            }
            if(!actor.isDie && ((rocker != null && rocker.moveDir == 0) || IInput.isKeyPress(RC.Key.down)) ){
                if(RV.NowSet.setAll.ctrlUpDown == 0){
                    if(!RV.GameData.actor.LSquat) actor.squat();
                }else{
                    if(!RV.GameData.actor.LMove) actor.moveDown();
                }
            }
            if(!actor.isDie && ((rocker != null && rocker.moveDir == 3) || IInput.isKeyPress(RC.Key.up)) ){
                if(RV.NowSet.setAll.ctrlUpDown == 1){
                    if(!RV.GameData.actor.LMove) actor.moveUp();
                }
            }
            if(!actor.isDie && (ctrlAction.isJumpClick || IInput.isKeyDown(RC.Key.jump))){
                if(RV.NowSet.setAll.ctrlUpDown == 0){
                    if(!RV.GameData.actor.LJump) actor.jump();
                }
            }

            //attack
            if(!actor.isDie){
                if(RV.GameData.actor.getSetData().attackType == 0){
                    if(ctrlAction.isAtkClick || IInput.isKeyDown(RC.Key.atk)){
                        if(!RV.GameData.actor.LAtk) actor.atk();
                    }
                }else{
                    if(ctrlAction.isAtkClick || IInput.isKeyPress(RC.Key.atk)){
                        if(!RV.GameData.actor.LAtk) actor.atk();
                    }
                }
            }

        }

        if(RV.isLoad){
            RV.isLoad = false;
            RF.LoadGame();
        }

    };

    //Execute asynchronous event collection queue
    function doInterpreterOther(){
        for(var i = RV.InterpreterOther.length - 1 ; i>= 0 ; i--){
            RV.InterpreterOther[i].update();
            if(RV.InterpreterOther[i].isEnd){
                RV.InterpreterOther.remove(RV.InterpreterOther[i]);
            }
        }
    }

    /**
     * Main Dispose
     */
    this.dispose = function(){
        if(dialog != null){
            dialog.dispose();
            dialog = null;
        }
        for(var key in dialogParallel){
            dialogParallel[key].dispose();
        }
        dialogParallel = {};
        map.dispose();
        buttonMenu.dispose();
        display.dispose();
        RV.GameData.actor.dispose();
        if(rocker != null) rocker.dispose();
        if(ctrlAction != null) ctrlAction.dispose();
        if(ctrlItem != null) ctrlItem.dispose();
        if(actorStatus != null) actorStatus.dispose();
        if(buttonMenu != null) buttonMenu.dispose();
        if(buff != null) buff.disposeAll();
        if(bossBar != null) bossBar.dispose();
    };

    /**
     * Set Modal Dialog
     * @param dl | dialog box
     * @param endFuc | callback after the dialog end
     */
    this.setDialog = function(dl,endFuc){
        dialog = dl;
        if(dialog != null){
            dialog.endDo = function(obj){
                endFuc(obj);
                dialog = null;
            }
        }

    };
    /**
     * Set up Parallel dialog
     * @kname | key name of window
     * @param dl | dialog box
     * @param endFuc | callback after the dialog end
     */
    this.setDialogParallel = function(kname,dl,endFuc){
        if(dialogParallel[kname] != null){//window with the same name will be disposed
            dialogParallel[kname].dispose();
            delete  dialogParallel[kname];
        }
        dialogParallel[kname] = dl;
        dialogParallel[kname].endDo = function(obj){
            endFuc(obj);
            delete  dialogParallel[kname];
        }
    };

    this.getDialogParallel = function(kname){
        return dialogParallel[kname];
    };

    /**
     * get inventory slots
     * @returns {*}
     */
    this.getCtrlItem = function(){
        return ctrlItem;
    };

    /**
     * get skill slots
     * @returns {*}
     */
    this.getCtrlAction = function(){
        return ctrlAction;
    };

    /**
     * Exposing private attributes，and execute
     * @param code
     */
    this.getEval = function(code){
        return eval(code);
    };

    /**
     * get control of main
     * @param ctrl 0:get skill slots 1:inventory slots 2:actor status 3:menu button 4:rocker 5 buff
     */
    this.getCtrl = function(ctrl){
        if(ctrl == 0){
            return ctrlAction;
        }else if(ctrl == 1){
            return ctrlItem;
        }else if(ctrl == 2){
            return actorStatus;
        }else if(ctrl == 3){
            return buttonMenu;
        }else if(ctrl == 4){
            return rocker;
        }else if(ctrl == 5){
            return buff;
        }
    }
}/**
 * Created by Yitian Chen on 2019/06/20.
 */ /**
 * Created by Yitian Chen on 2019/4/25.
 * iFActionGameStart
 * Program script entry point
 */
function iFActionGameStart(){
    //Set DEBUG mode
    IVal.DEBUG = false;
    //Set the default text color
    IVal.FontColor = IColor.White();
    //Set the default text size
    IVal.FontSize = 18;
    //Set the first Scene
    IVal.scene = new SStart();
}