from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, KeepTogether, Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "documents" / "FabriPass-Website-User-Manual.pdf"
LOGO = ROOT / "public" / "brand" / "fabripass-logo.png"

NAVY = colors.HexColor("#111A16")
GREEN = colors.HexColor("#203D33")
GOLD = colors.HexColor("#B99A5B")
PARCHMENT = colors.HexColor("#F5F0E6")
INK = colors.HexColor("#17231E")
MUTED = colors.HexColor("#66736D")
BURGUNDY = colors.HexColor("#713B3A")
LINE = colors.HexColor("#CEC2AA")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverKicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=9, leading=12, textColor=GOLD, spaceAfter=8, tracking=1.5))
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Times-Roman", fontSize=34, leading=38, textColor=WHITE, alignment=TA_LEFT, spaceAfter=12))
styles.add(ParagraphStyle(name="CoverBody", parent=styles["BodyText"], fontName="Helvetica", fontSize=12, leading=18, textColor=colors.HexColor("#DCE3DE"), spaceAfter=10))
styles.add(ParagraphStyle(name="SectionKicker", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=8, leading=11, textColor=BURGUNDY, tracking=1.3, spaceAfter=7))
styles.add(ParagraphStyle(name="SectionTitle", parent=styles["Heading1"], fontName="Times-Roman", fontSize=26, leading=30, textColor=INK, spaceAfter=12))
styles.add(ParagraphStyle(name="H2x", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=13, leading=17, textColor=GREEN, spaceBefore=9, spaceAfter=6))
styles.add(ParagraphStyle(name="Bodyx", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=14.2, textColor=INK, spaceAfter=7))
styles.add(ParagraphStyle(name="Smallx", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.8, leading=11, textColor=MUTED))
styles.add(ParagraphStyle(name="StepNo", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=16, textColor=GOLD, alignment=TA_CENTER))
styles.add(ParagraphStyle(name="Callout", parent=styles["BodyText"], fontName="Helvetica-Bold", fontSize=9.2, leading=13.5, textColor=WHITE))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(20*mm, 14*mm, 190*mm, 14*mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(20*mm, 9.5*mm, "FABRIPASS - WEBSITE USER MANUAL")
    canvas.drawRightString(190*mm, 9.5*mm, f"PAGE {doc.page}")
    canvas.restoreState()

def step(number, title, body):
    badge = Table([[Paragraph(str(number).zfill(2), styles["StepNo"]) ]], colWidths=[15*mm], rowHeights=[15*mm])
    badge.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),GREEN),("BOX",(0,0),(-1,-1),0.7,GOLD),("VALIGN",(0,0),(-1,-1),"MIDDLE")]))
    text = [Paragraph(title, styles["H2x"]), Paragraph(body, styles["Bodyx"])]
    block = Table([[badge, text]], colWidths=[20*mm, 145*mm], hAlign="LEFT")
    block.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"TOP"),("BOTTOMPADDING",(0,0),(-1,-1),7)]))
    return block

def callout(title, body, color=GREEN):
    table = Table([[Paragraph(title, styles["Callout"]), Paragraph(body, ParagraphStyle(name="CalloutBody", parent=styles["Bodyx"], textColor=WHITE, fontSize=8.7, leading=12.5))]], colWidths=[42*mm,123*mm])
    table.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),color),("BOX",(0,0),(-1,-1),0.7,GOLD),("VALIGN",(0,0),(-1,-1),"TOP"),("LEFTPADDING",(0,0),(-1,-1),10),("RIGHTPADDING",(0,0),(-1,-1),10),("TOPPADDING",(0,0),(-1,-1),9),("BOTTOMPADDING",(0,0),(-1,-1),9)]))
    return table

def section(kicker, title, intro=None):
    parts = [Paragraph(kicker, styles["SectionKicker"]), Paragraph(title, styles["SectionTitle"])]
    if intro: parts.append(Paragraph(intro, styles["Bodyx"]))
    return parts

def bullets(items):
    return [Paragraph("- " + item, styles["Bodyx"]) for item in items]

doc = SimpleDocTemplate(str(OUT), pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=19*mm, bottomMargin=20*mm, title="FabriPass Website User Manual", author="FabriPass")
story = []

# Cover
cover_logo = Image(str(LOGO), width=54*mm, height=54*mm)
cover_top = Table([[cover_logo, Paragraph("FABRIPASS<br/><font size='8'>DIGITAL PRODUCT PASSPORT</font>", ParagraphStyle(name="Brand", fontName="Helvetica-Bold", fontSize=19, leading=20, textColor=WHITE))]], colWidths=[62*mm,103*mm])
cover_top.setStyle(TableStyle([("VALIGN",(0,0),(-1,-1),"MIDDLE"),("LEFTPADDING",(0,0),(-1,-1),0)]))
cover = Table([[cover_top],[Spacer(1,10*mm)],[Paragraph("WORKING PLATFORM GUIDE / 2026",styles["CoverKicker"])],[Paragraph("A clear, step-by-step guide to the FabriPass website",styles["CoverTitle"])],[Paragraph("Create garment records, add a public product photo, review readiness, publish a sanitized Live Demo sample, generate a QR and record a checkpoint from another phone.",styles["CoverBody"])],[Spacer(1,7*mm)],[Paragraph("For garment factory owners, merchandisers, compliance teams, sourcing teams and buyers.",styles["CoverBody"])],[Spacer(1,16*mm)],[callout("READ THIS FIRST","The platform is a working prototype. Readiness measures completeness for internal review. It is not an EU certificate, authenticity proof or GPS tracking service.",BURGUNDY)]], colWidths=[170*mm], rowHeights=[None]*9)
cover.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,-1),NAVY),("BOX",(0,0),(-1,-1),1,GOLD),("LEFTPADDING",(0,0),(-1,-1),14*mm),("RIGHTPADDING",(0,0),(-1,-1),14*mm),("TOPPADDING",(0,0),(0,0),11*mm),("BOTTOMPADDING",(0,-1),(-1,-1),12*mm)]))
story += [Spacer(1,6*mm), cover, PageBreak()]

story += section("01 / START HERE", "The website has three connected experiences.", "Use the landing page to explain the concept, the Live Demo to prove the scan-and-track flow, and the signed-in workspace to create private factory records.")
overview = [["AREA","WHO CAN OPEN IT","WHAT IT DOES"],["Landing page","Public Site visitors","Explains the garment scenario, product anatomy and pilot value."],["Live Demo","Public Site visitors","Shows sample products, product QR codes and shared checkpoint history."],["Workspace","Signed-in users","Stores private product records, suppliers, buyer assignments, evidence and reviews."],["Resources","Public Site visitors","Explains workflow, trust boundaries, pilot steps, privacy and prototype terms."]]
t=Table([[Paragraph(str(c), styles["Smallx"]) for c in row] for row in overview], colWidths=[34*mm,42*mm,89*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),WHITE),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),0.5,LINE),("VALIGN",(0,0),(-1,-1),"TOP"),("BACKGROUND",(0,1),(-1,-1),PARCHMENT),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story += [t, Spacer(1,5*mm), callout("PUBLIC AND PRIVATE","Product photos uploaded in the workspace are deliberately public in the sanitized Live Demo. Buyer names, supplier identities, internal notes and evidence files remain private."), Paragraph("Recommended demonstration order",styles["H2x"])]
story += [step(1,"Open the landing page","Start with the exploded garment. Select the magnifying-glass QR to enter Live Demo."),step(2,"Run the two-device scan","Keep the demo open on a laptop. Scan the QR with a phone and confirm a checkpoint."),step(3,"Show the workspace","Sign in, create or edit a product, add an optional photo and review the readiness gaps."), PageBreak()]

story += section("02 / LANDING PAGE", "Explain the value in under two minutes.", "The landing page is designed for a first buyer conversation. Its job is to make the workflow understandable before the detailed records appear.")
story += [step(1,"Start with product anatomy","The exploded blazer shows that a garment record can describe shell, lining, interlining, trims and labels as connected parts of one product story."),step(2,"Open the QR lens","Select the magnifying glass over the QR. It takes you directly to the Live Demo."),step(3,"Review the four platform blocks","Explain one product record, evidence with context, a visible journey and a scan that connects."),step(4,"Use the garment scenario","Walk through Factory QC, Packing, Dispatch and Buyer received. These are demo checkpoint events, not verified logistics milestones."),step(5,"Open buyer resources","Use Resources for the trust boundary, data dictionary, pilot plan, privacy notice and prototype terms."),step(6,"Use the pilot form","Enter authorized business information only. The form stores the inquiry for a discussion; it does not send email or book a meeting.")]
story += [Spacer(1,4*mm), callout("PRESENTATION TIP","Lead with a real buyer request your team receives today. Show where FabriPass would hold each fact and which evidence would support it."), PageBreak()]

story += section("03 / LIVE DEMO", "Scan on one phone. Watch the event on another.", "The demo creates a session in the URL, generates a product QR and polls the shared history every five seconds.")
story += [step(1,"Open Live Demo on the main screen","A session parameter is added to the browser URL. Save the full URL if you want to return to the same event history."),step(2,"Choose a garment","Select one of the built-in samples. When signed in, your newest workspace products appear first as sanitized samples."),step(3,"Inspect the product record","Confirm style, batch, composition, origin, quantity, fabric description and care text. A workspace photo appears above the facts when one has been uploaded."),step(4,"Scan the QR","Open the phone camera and scan. If scanning is unavailable, select Copy link and open the link on the second device."),step(5,"Confirm a checkpoint","Choose Factory QC, Packing, Dispatch or Buyer received. Select Confirm demo check-in."),step(6,"Watch the history update","The main screen refreshes within five seconds. Each event includes checkpoint, product, unique event ID and server timestamp."),step(7,"Export or restart","Download the event history as JSON or select New demo session for a separate history.")]
story += [callout("WHAT A SCAN PROVES","The working flow proves URL resolution, user confirmation, server storage and shared history. It does not prove physical possession, GPS movement, origin, authenticity or certification.",BURGUNDY), PageBreak()]

story += section("04 / CREATE A PRODUCT", "Build a usable garment record.", "Sign in before opening Workspace. Sample records remain visible when signed out, but only authenticated workspaces can save products.")
story += [step(1,"Select New product","The product interface opens in the centre of the screen and stays within the browser height."),step(2,"Enter identity","Add product name and style code. Add batch, internal buyer assignment, manufacturing facility, country, category and quantity."),step(3,"Add a product image","Choose JPG, PNG or WebP up to 5 MB. The form marks this image as public because it appears in the Live Demo. Do not upload confidential artwork."),step(4,"Complete fibre composition","Add one or more fibres. The percentages must total exactly 100 before the record can save."),step(5,"Map supply stages","Enter supplier and country for Fibre and yarn, Fabric formation, Dyeing and finishing, and Garment making."),step(6,"Add care and circularity guidance","Write clear care, repair, reuse and end-of-life guidance that your team can support."),step(7,"Keep internal notes private","Internal notes stay outside the Live Demo and passport preview."),step(8,"Save product","FabriPass saves the private record, uploads the optional public photo, recalculates readiness and makes a sanitized QR record available in Live Demo.")]
story += [callout("IF THE PHOTO FAILS","The product record can save before the image upload. Reopen the product, choose the image again and save. The error message states when this partial save occurs."), PageBreak()]

story += section("05 / READINESS AND EVIDENCE", "Make missing support visible before sharing.", "Readiness is a simple eight-part completeness model. Each check has equal weight.")
checks = [[str(i+1).zfill(2), item] for i,item in enumerate(["Product identity and style code","Batch and production quantity","Manufacturing facility and country","Material composition totals 100%","Four supply-chain stages identified","Care and repair information","Reuse and end-of-life guidance","Current evidence internally reviewed"])]
t=Table([[Paragraph(a,styles["StepNo"]),Paragraph(b,styles["Bodyx"])] for a,b in checks], colWidths=[18*mm,147*mm])
t.setStyle(TableStyle([("GRID",(0,0),(-1,-1),0.5,LINE),("BACKGROUND",(0,0),(0,-1),GREEN),("VALIGN",(0,0),(-1,-1),"MIDDLE"),("TOPPADDING",(0,0),(-1,-1),7),("BOTTOMPADDING",(0,0),(-1,-1),7),("LEFTPADDING",(0,0),(-1,-1),9)]))
story += [t, Spacer(1,5*mm), Paragraph("Add evidence",styles["H2x"])]
story += [step(1,"Open Evidence library","Select Add evidence and choose the product the document supports."),step(2,"Classify the file","Choose Material test, Supplier declaration, Transaction certificate, Facility certificate or Other. Add an expiry date when applicable."),step(3,"Upload the original","Accepted formats are PDF, PNG and JPEG up to 10 MB. The uploaded file remains private."),step(4,"Review its scope","Check authenticity, validity, product linkage and scope. Mark reviewed only when your internal process is complete."),step(5,"Expect review reset after product edits","Changing a product creates a new revision and conservatively resets linked review states."),callout("READINESS IS NOT VERIFICATION","A full score means the eight required pieces are present for internal review. Responsible teams must still verify accuracy, legality and evidence scope.",BURGUNDY), PageBreak()]

story += section("06 / PUBLIC AND PRIVATE DATA", "Share a useful sample without exposing factory detail.", "The Live Demo mapping deliberately selects a small public subset from a signed-in product record.")
mapping = [["PUBLIC LIVE DEMO","PRIVATE WORKSPACE"],["Product name, style code and batch","Buyer assignment"],["Category and composition","Facility and supplier identities"],["Country of manufacture and quantity","Internal notes"],["Care instructions","Evidence files and review details"],["Optional product photo","Full private workspace activity"],["Demo checkpoint events","Private passport and evidence routes"]]
t=Table([[Paragraph(c,styles["Bodyx"]) for c in row] for row in mapping], colWidths=[82.5*mm,82.5*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),WHITE),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),0.6,LINE),("BACKGROUND",(0,1),(0,-1),colors.HexColor("#E6EEE8")),("BACKGROUND",(1,1),(1,-1),colors.HexColor("#EEE5D7")),("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story += [t, Spacer(1,6*mm), callout("PRODUCT PHOTO RULE","The product image is public by design after upload. The form, Live Demo notice and Resources page all state this boundary. Use approved sample imagery only."), Paragraph("Privacy in the demo",styles["H2x"])] + bullets(["Do not enter personal or confidential information in demo checkpoints.","The application does not request GPS location or access a camera feed.","A phone camera reads the QR and opens a normal web link.","Anyone with the session link and Site access can view or add demo events.","Formal retention, deletion, support and processing terms must be agreed before commercial onboarding."]) + [PageBreak()]

story += section("07 / TROUBLESHOOTING", "Fast checks for a smooth client demonstration.")
issues = [["SYMPTOM","WHAT TO DO"],["Product form appears off-screen","Reload the latest release. The dialog should open fixed in the centre. On mobile it uses nearly the full viewport."],["Workspace product is not in Live Demo","Confirm you are signed in, save the product, then reload Live Demo. Signed-out visitors see built-in samples only."],["Photo does not appear","Reopen the product, choose a JPG, PNG or WebP under 5 MB, save, then reload Live Demo."],["Phone cannot scan the QR","Use Copy link, send it to the phone and open it in the browser."],["Checkpoint does not appear","Confirm the phone submitted the form, keep the same session URL, wait five seconds and reload."],["Charts look empty","Confirm products are visible in the workspace. The charts use current product readiness values."],["Evidence cannot be reviewed","Confirm the file exists, is not expired and belongs to the current product revision."],["You see sample records only","Select Sign in to save. Private workspace APIs require an authenticated session."]]
t=Table([[Paragraph(c,styles["Smallx"]) for c in row] for row in issues], colWidths=[52*mm,113*mm], repeatRows=1)
t.setStyle(TableStyle([("BACKGROUND",(0,0),(-1,0),GREEN),("TEXTCOLOR",(0,0),(-1,0),WHITE),("FONTNAME",(0,0),(-1,0),"Helvetica-Bold"),("GRID",(0,0),(-1,-1),0.5,LINE),("BACKGROUND",(0,1),(-1,-1),PARCHMENT),("VALIGN",(0,0),(-1,-1),"TOP"),("TOPPADDING",(0,0),(-1,-1),8),("BOTTOMPADDING",(0,0),(-1,-1),8)]))
story += [t, Spacer(1,6*mm), callout("DEMO CHECKLIST","Use two charged devices, keep the laptop session URL open, allow five seconds for refresh, and prepare one approved product image before the meeting."), PageBreak()]

story += section("08 / CLIENT DEMO SCRIPT", "A practical 10-minute buyer walkthrough.", "Use this structure to keep the conversation focused on operational value and trust.")
story += [step(1,"Minute 0-2: frame the problem","Explain one repeated buyer data request and where the source information currently lives."),step(2,"Minute 2-4: show product anatomy","Use the exploded garment to explain identity, materials, components, evidence and traceability."),step(3,"Minute 4-7: run the live scan","Choose a product, scan with a phone, confirm a checkpoint and show it appear on the laptop."),step(4,"Minute 7-9: open the workspace","Show the product photo, private buyer and supplier fields, readiness score and evidence library."),step(5,"Minute 9-10: agree a pilot question","Choose one factory, one buyer and one measurable workflow to test over the proposed six weeks."),Paragraph("Questions to ask",styles["H2x"])] + bullets(["Which garment facts are requested most often?","Which source documents support those facts?","Who owns each field inside the factory?","What may be shared with a buyer, and what must remain private?","What would make a six-week pilot worth continuing?"]) + [Spacer(1,4*mm), callout("FINAL MESSAGE","FabriPass gives the team a working place to assemble the record, see missing support, share a controlled sample and demonstrate a real QR checkpoint flow."), Spacer(1,5*mm), Paragraph("End of manual - version prepared for the FabriPass prototype release.",styles["Smallx"])]

OUT.parent.mkdir(parents=True, exist_ok=True)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
