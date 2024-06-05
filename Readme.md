<h1>BLOG Backend</h1>
<hr/>
<p>
<ul>
<li>This is the node + express server for the backend aspect of the ongoing Blog project. </li>
<li>The packages used:
    <ul>
    <li>Express - for creating a web server</li>
    <li>Prisma - ORM to abstract the DB layer</li>
    <li>CORS - for Cross origin requests</li>
    <li>Helmet - for security</li>
    <li>Multer - for file upload</li>
    <li>Cloudinary - for asset storage</li>
    </ul>
</li>
<li>To run the project : 
    <ol>
    <li>npm install</li>
    <li>Create an .env file and add the database link + port + cloudinary secret keys</li>
    <li>npx prisma generate</li>
    <li>npm run dev</li>
    </ol>
</li>
</ul>
</p>