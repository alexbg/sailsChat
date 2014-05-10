/**
 * ChatController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	
  /**
   * `ChatController.index`
   */

  index: function (req, res) {
    
    var lista;
    
    Sessions.find({}).exec(function(err,list){
        lista = list;
    });
    
    
    return res.view('chat/index',{list: lista});
  },
  
  global: function(req, res){
      
      
  },
  
  // configura y obtiene la informacion basica del usuario sobre la session en la
  // base de datos global y devuelve las invitaciones, chat con sus mensajes 
  insert: function(req, res){
    console.log('entra en el insert '+ req.session.user.idSession);
    Sessions.findOne({id: req.session.user.idSession}).exec(function(err,user){
        if(typeof user === 'undefined'){
            Sessions.create({
                destroy: false,
                //idUser: req.session.user.id,
                username: req.session.user.username
            }).exec(function(err,created){
                if(typeof created === 'undefined'){
                    console.log('No ha creado el usuario');
                }
                else{
                    //Envio un mensaje cuando el nuevo usuario ha sido creado
                    req.session.user.idSession = created.id;
                    Relation.create({idSession: created.id,socket: req.socket.id}).exec(function(err,relation){
                        if(typeof relation === 'undefined'){
                            console.log('no ha creado la relacion');
                        }
                        else{
                            sails.sockets.broadcast('global','insertInTable',created,req.socket);
                            req.session.save();
                            console.log(req.session.user.idSession);
                        }
                    });
                    //console.log(created.id);
                }
            });
            
        }
        else{
            //actualizo el socket, para tenerlo siempre disponible el de cada usuario
            var petitionsCreated = new Array();
            var roomsCreated = new Array();
            console.log('actualizacion del socket');
            
            Relation.update({idSession: req.session.user.idSession},{socket: req.socket.id}).exec(function(err,socket){
                
                Rooms.find({idInvited: req.session.user.idSession}).exec(function(err,petitions){
                    console.log(petitions);
                    petitions.forEach(function(value){
                        
                        if(value.petition == true){
                            // guarda cada peticion en petitionsCreated
                            petitionsCreated.push({id: value.id,username: value.creatorName});
                        }
                        else{
                            // guarda las salas en las que estaba
                            roomsCreated.push({id: value.id,});
                            // y le vuelve a meter en la sala
                            sails.sockets.join(req.socket,value.id);
                        }
                    }); 
                });
            });
            
            sails.sockets.emit(req.socket.id,'recovery',{petitions: petitionsCreated,rooms: roomsCreated});
            
        };
         
    });
      
    sails.sockets.join(req.socket,'global'); 
    req.session.user.rooms.push('global');
    //console.log('habitaciones: '+sails.sockets.socketRooms(req.socket));
    
  },
  
  
  /**
   * Elimina todas las sessiones
   * @param {type} req
   * @param {type} res
   * @returns {undefined}
   */
  destroy: function(req, res){
      
      
      Sessions.destroy({}).exec(function(err,deleted){
          
      });
  },
  
  /**
   * No hace nada
   * @param {type} req
   * @param {type} res
   * @returns {undefined}
   */
  message: function(req, res){
      //console.log('HA LLEGADOOOOO');
      sails.sockets.blast('prueba','Este es el mensaje de prueba'); 
  },
  
  updateTable: function(req, res){
      
      
      
  },
  
  /**
   * No hace nada
   * @param {type} req
   * @param {type} res
   * @returns {undefined}
   */
  insertChat: function(req, res){
      
      sails.sockets.join(req.socket,'chat');
      req.session.user.rooms.push('chat');
      console.log('CHAT A:ADIDO');
      
  },
  
  /**
   * Mediante la id obtenida, envia informacion sobre el usuario de esa id
   * al socket que ha realizado esa peticion
   * @param {type} req
   * @param {type} res
   * @returns {undefined}
   */
  showProfile: function(req, res){
      var user;
      Sessions.findOne({id: req.param('id')}).exec(function(err,finded){
        user = finded;
      });
      
      res.json(user);
  },
  
  /**
   * Genera una invitacion y envia la invitacion al usuario
   * @param {type} req
   * @param {type} res
   * @returns {undefined}Permite crear una invitacion
   */
  invite: function(req, res){
      console.log('id del invite '+req.param('id'));
      var roomName = req.session.idSession+req.param('id');
      Rooms.create({idCreator: req.session.user.idSession,
                    name: roomName, idInvited: req.param('id'),petition:true,creatorName: req.session.user.username}).exec(function(err,room){
            
            if( typeof room === 'undefined'){
                console.log('no se ha creado');

            }
            else{
                
                Relation.findOne({idSession: req.param('id')}).exec(function(err,socket){
                   if(typeof socket === 'undefined'){
                      console.lgg('no ha encontrado al usuario')
                   }
                   else{
                       
                       var prueba = socket.socket;
                       // envia un mensaje al usuario invitado
                       console.log(prueba);
                       console.log(req.socket.id);
                       sails.sockets.emit(prueba,'request',{
                           username: req.session.user.username,
                           room: room.id 
                       }); 
                   }
                   
                });
            }
      });
      
      return res.json('Peticion enviada');
      
  },
  
  // acepta la peticion
  accept: function(req, res){
      
      Rooms.update({id: req.param('id')},
                    {petition: false}).exec(
                            function(err,room){
          
          if(typeof room[0] === 'undefined'){
              
          }
          else{
              
              // obtengo el usuario que ha creado la invitacion
              Relation.findOne({idSession: room[0].idCreator}).exec(function(err,user){
                 if(typeof user === 'undefined'){
                     
                 }
                 else{
                     // emito un mensaje al usuario diciendole que han aceptado su peticion
                     sails.sockets.emit(user.socket,'info',{
                        message: 'El usuario: '+req.session.user.username+' ha aceptado su invitacion',
                        type: 'info'
                     });
                     
                     // Los añado a la la habitacion
                     console.log('Esta es la habitacion: '+ room[0].id);
                     sails.sockets.join(user.socket,room[0].id);
                     sails.sockets.join(req.socket,room[0].id);
                     
                     // envio el nombre de la habitacion y el nombre de los
                     // usuarios
                     sails.sockets.broadcast(room[0].id,'createPrivateRoom',{
                         id: room[0].id,
                         creator: user.idSession,
                         invited: req.session.user.idSession
                     });
                 }
              });
          } 
      });
      
      return res.json({id: req.param('id')});
      
  },
  
  // no acepta la peticion
  reject: function(req, res){
      
      // destruyo la sala creada
      Rooms.destroy({id: req.param('id')}).exec(function(err,destroyed){
         if(typeof destroyed === 'undefined'){
         }
         else{
             // obtengo el socket del creador para enviarlle un mensaje 
             Relation.findOne({idSession: destroyed[0].idCreator}).exec(function(err,user){
                 // emito al creador de la peticion, que el usuario ha rechazado su peticion
                 sails.sockets.emit(user.socket,'info',{
                     message: 'El usuario: '+req.session.user.username+' ha rechazado su invitacion',
                     type: 'info'
                 }); 
                 
             }); 
         }
      });

      return res.json({id: req.param('id')});
      
  },
  
  // obtengo el html de la sala privada
  getPrivateRoom: function(req, res){
      console.log(req.param('info'));
      res.view('chat/privateChat',{layout: null,data: req.param('info')});
      
  },
  
  send: function(req, res){
    
    console.log('ha entrado al senddddd');
    
    var message = {
        username: req.session.user.username,
        message: req.param('message'),
        id: req.param('room')
    }
    
    sails.sockets.broadcast(req.param('room'),'send',message);  
    
    return res.json(true);
  },
  
  upload: function(req, res){
      
      console.log('uploaddd');
      
  }
  
};
