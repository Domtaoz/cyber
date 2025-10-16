class Config:
    """
    คลาสสำหรับเก็บค่า Configuration ทั้งหมดของโปรเจกต์โดยตรงในโค้ด
    """

    @staticmethod
    def load_db_config():
        """
        คืนค่าการตั้งค่าของฐานข้อมูล
        """
        db_config = {
            'host': '127.0.0.1',
            'user': 'root',
            'password': '123456', 
            'database': 'cyber'
        }
        return db_config

    @staticmethod
    def load_server_config():
        """
        คืนค่าการตั้งค่าของ Server
        """
        server_config = {
            'port': 8000
        }
        return server_config

