/**
 * Bootstrap
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

  Sessions.destroy({}).exec(function(err,list){
      
  });
  
  Relation.destroy({}).exec(function(err,list){
      
  });
  
  Rooms.destroy({}).exec(function(err,list){
      
  });

  setInterval(function(){
      Sessions.destroy({destroy: true}).exec(function(err,user){
          if(user.length>=1){
               
               user.forEach(function(value){
                  console.log('Usuarios han sido eliminados');
                  sails.sockets.broadcast('global','removeInTable',value.id);
               });
          }  
      });
  },5000);
  

  // It's very important to trigger this callack method when you are finished 
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  cb();
};