/*
 * cacheLocal.js
 * v1.0 - 2017-10-13
 * https://github.com/wdchui/cacheLocal
 */
(function(){
    window.cacheLocal = {
        keyPrefix:"cacheLocal_",
        resourceChain:[],
        checkSupport:function(){
            try{
                return window.localStorage && window.JSON || false;
            }catch(e){
                return false;
            }
        },
        setItem:function(item){
            try{
                localStorage.setItem(cacheLocal.keyPrefix + item.key, JSON.stringify(item));
            }catch(e){
                return false;
            }
        },
        getItem:function(itemKey){
            var item = localStorage.getItem(cacheLocal.keyPrefix + itemKey);
            try{
                return JSON.parse(item || 'false');
            }catch(e){
                return false;
            }
        },
        removeItem:function(itemKey){
            localStorage.removeItem(cacheLocal.keyPrefix + itemKey);
        },
        getUrl:function(obj, callback){
            try{
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if ( xhr.readyState === 4 && (( xhr.status === 200 ) || (( xhr.status === 0 ) && xhr.responseText ))) {
                        var item = {
                            key:obj.key,
                            value:xhr.responseText,
                            version:obj.version
                        }
                        typeof callback === 'function' && callback(item);
                        if(obj.type == 'js'){
                            cacheLocal.evalJs(xhr.responseText);
                        }
                        if(obj.type == 'css'){
                            cacheLocal.evalCss(xhr.responseText);
                        }
                        var nextRes = cacheLocal.resourceChain.shift();
                        nextRes && cacheLocal.loadRes(nextRes);
                    }
                };
                xhr.open( 'GET', obj.url+'?v='+obj.version, false);
                xhr.send();
            }catch(e){
                //to do sth
            }
        },
        isNew:function(itemKey, version){
            var item = cacheLocal.getItem(itemKey);
            if(item){
                return item.version == version;
            }else{
                return false;
            }
        },
        loadRes:function(obj){
            if(cacheLocal.checkSupport()){
                if(cacheLocal.isNew(obj.key, obj.version)){
                    var item = cacheLocal.getItem(obj.key);
                    if(obj.type == 'js'){
                        cacheLocal.evalJs(item.value);
                    }
                    if(obj.type == 'css'){
                        cacheLocal.evalCss(item.value);
                    }
                    var nextRes = cacheLocal.resourceChain.shift();
                    nextRes && cacheLocal.loadRes(nextRes);
                }else{
                    cacheLocal.removeItem(obj.key);
                    cacheLocal.getUrl(obj,cacheLocal.setItem);
                }
            }else{
                cacheLocal.getUrl(obj);
            }
        },
        evalJs:function(text){
            var head = document.head || document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.text = text;
            head.appendChild(script);
        },
        evalCss:function(text){
            cssNode = '<style>'+text+'</style>';
            document.write(cssNode);
        }
    }
})();