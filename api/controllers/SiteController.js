/**
 * SiteController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	

  /**
   * `SiteController.index`
   */

  index: function (req, res) {
    res.view('site/index');
    //console.log(req.session);
  },

  /**
   * `SiteController.login`
   * loguea el usuario creandole un registro en Sessions y en su sessiond e usuario
   * se guarda informacion sobre el
   */

  login: function (req, res) {
    
      if(req.param('email')){
          Users.findOne({email: req.param('email')}).exec(function found(err,user){
              if(typeof user === 'undefined'){
                  console.log('Usuario no encontrado');
              }
              else{
                  if(user.password == req.param('password')){
                      console.log('Usuario logueado');
                      req.session.user = {
                          chat: true,
                          id: user.id,
                          username: user.username,
                          rooms: [],
                          idSession:  0,
                      },
                      res.redirect('site/index');
                  }
                  console.log(user);
              }
          });
      }
    
    var form = {
        title: "Login", //page title
        action: "login", //post action for the form
        fields: [
        {label:'Email',name:'email',type:'text',property: 'class=error'},   //first field for the form
        {label:'Password',name:'password',type:'password',property: 'class=error'}   //another field for the form
        ]
    }
    res.view('site/login',form);
  },

  /**
   * Registra un usuario en Users
   */
  register: function(req, res){
        var errors = 'weeee';
        if(req.param('username')){
            Users.create({
                username: req.param('username'),
                email: req.param('email'),
                password: req.param('password'),
                description: req.param('description')
            }).exec(function(err, user){
                if(err){
                    console.log(err['ValidationError']);
                }
                else{
                    //console.log('usuario Creado');
                    res.redirect('site/index');
                }
            });
        }
        
        var form = {
          title: "Register", //page title
          action: "register", //post action for the form
          fields: [
          {label:'Username',name:'username',type:'text',property: 'class=error'},
          {label:'Email',name:'email',type:'text',property: 'class=error'},   
          {label:'Password',name:'password',type:'password',property: 'class=error'},
          ],
          errors: errors
        
      
      
    }
    res.view('site/register',form);
      
  },
  
  /**
   * Desloguea un usuario de forma parcial
   */
  logout: function(req, res){
      
      Sessions.destroy({id: req.session.user.idSession}).exec(function(err,user){
          
          //Enviar a todos los usuarios la informacion de que se ha deslogueado el 
          //usuario
          req.session.user = null;
          
      });
      
      //req.session.user = null;
      
      res.redirect('site/index');
      
  },
};
