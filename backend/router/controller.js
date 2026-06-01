exports.register = async (req res) => {
   try {
      res.status(200).json({ success: true, error: 'router for the weeke' });
   } catch(error) {
      res.status(500).json({ success: false, error: err.message });
   }
};