//策略方法，验证需要的函数
var strategies = {
    isNonEmpty:function( value, errorMsg ){
        if( value === ''  ){
            return errorMsg;
        }
    },
    minLength: function( value, length,errorMsg ){
        if( value.length < length ){
            return errorMsg;
        }
    },
    isMobile: function( value, errorMsg ){
        if(!/^1[3|5|8][0-9]{9}$/.test( value )){
            return errorMsg;
        }
    }
}

function Validator(){
    this.cache = [];
}
//添加验证的信息，只能一次添加一条验证
Validator.prototype.add = function( dom,strategyAndValue,errorMsg ){
    var arg = strategyAndValue.split(':')
    var strategy = arg.shift()
    //把arg凑成strategies的属性方法需要的参数格式，再运用apply执行
    arg.unshift( dom.value )
    arg.push( errorMsg )
    this.cache.push( function() {
        return strategies[strategy].apply( dom, arg )
    })
}

/**
 * 
 * @param {需要验证的表单数据} dom 
 * @param {该数据需要经过的验证方法集合} rules 
 * [
 *    {strategy:'isNonEmpty',errorMsg:'不能为空'},
 *    {strategy:'minLength:3',errorMsg:'最小长度为3'}
 * ]
 */
Validator.prototype.addMuti = function( dom,rules ){
    var self = this;
    for(let rule of rules){
        (function(rule){
            var arg = rule.strategy.split(':')
            var strategy = arg.shift()
            arg.unshift( dom.value )
            arg.push( rule.errorMsg )
            self.cache.push( function() {
                //如果不用闭包，在该方法执行时候strategy会变成最后一个的数据
                return strategies[strategy].apply( dom, arg )
            })
        })(rule)
    }
}


Validator.prototype.start = function(){
    //一次执行this.cache里面的验证函数
    for( var i = 0; i<this.cache.length; i++ ){
        var err = this.cache[i]()
        if( err ){
            return err;
        }
    }
}

//验证函数,只能一次为表单添加一个验证函数
var ValidatorFun = function(){
    var validator = new Validator()
    validator.add(registerForm.name,'isNonEmpty','不能为空')
    validator.add(registerForm.psw,'minLength:3','至少3个字符')
    validator.add(registerForm.phone,'isMobile','输入正确的电话')
    var err = validator.start()
    return err;
}

//验证函数单个验证函数，可以一次为一个input添加多个验证函数
var ValidatorMutiFun = function(){
    var validator = new Validator()
    validator.addMuti(registerForm.name,[
        {strategy:'isNonEmpty',errorMsg:'不能为空'},
        {strategy:'minLength:3',errorMsg:'最小长度为3'}
    ])
    var err = validator.start()
    return err;
}


var bt = document.querySelector('#bt')
bt.onclick = function(){
    var err = ValidatorMutiFun()//开始验证
    if(err){//加入有错误则报错
        console.log(err)
        return;//报错阻止提交
    }
}

